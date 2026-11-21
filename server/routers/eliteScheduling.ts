import { createHash, randomBytes, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { enrollmentSnapshotSchema } from "../enrollmentAgreement.js";
import { accessPeriodOpen } from "../../shared/courseAccessPeriod.js";
import { buildTeachingSchedule, covered, overlaps, reportReady, validDay, type AvailabilityWindow } from "../../shared/eliteSchedule.js";
import { sydneyDate } from "../../shared/standardSupport.js";
import { users, enrollments, lessons, studentFileEntries, eliteTutors, eliteScheduleLock,
  eliteFamilyInvites, eliteAllocations, eliteTeachingSessions, eliteSessionReports, eliteReplacements } from "../../drizzle/schema.js";

import { replacementPlan, bookingFingerprint, nextReplacement, type ReplacementPlan } from "../../shared/eliteReplacement.js";

const id = z.number().int().positive().safe();
const timezone = z.string().min(1).max(100).refine(value => {
  try { new Intl.DateTimeFormat("en-AU",{timeZone:value}).format(); return true; } catch { return false; }
},"Choose a valid time zone.");
const windowSchema = z.object({day:z.number().int().min(0).max(6),start:z.number().int().min(0).max(1380),
  end:z.number().int().min(60).max(1440)}).strict().refine(w=>w.end-w.start>=60 && w.start%30===0 && w.end%30===0);
const windowsSchema=z.array(windowSchema).min(1).max(28);
const familyInput=z.object({enrollmentId:id,token:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
const bookingInput=familyInput.extend({weekStart:z.string().refine(validDay),timezone,
  slots:z.array(z.object({day:z.number().int().min(0).max(6),minute:z.number().int().min(0).max(1380)}).strict()).length(2)});
const text=z.string().trim().min(10).max(2000);
const reportFields=z.object({lessonUnderstanding:text,nextObjectives:text,progressDifficulties:text,assignedWork:text,tutorComments:text}).strict();
const read=protectedProcedure.use(async({ctx,next})=>{
  ctx.res.setHeader("Cache-Control","no-store");
  if(ctx.user.accountStatus!=="active") throw new TRPCError({code:"FORBIDDEN",message:"Active account required."});
  return next();
});
const admin=read.use(({ctx,next})=>{
  if(ctx.user.role!=="admin") throw new TRPCError({code:"FORBIDDEN",message:"Admin access required."});
  return next();
});
const teacher=read.use(({ctx,next})=>{
  if(ctx.user.role!=="teacher") throw new TRPCError({code:"FORBIDDEN",message:"Tutor access required."});
  return next();
});
function origin(ctx:any) {
  if(ctx.req.headers.origin!==getSignInOrigin()) throw new TRPCError({code:"FORBIDDEN",message:"Invalid request origin."});
}
async function lock(tx:any) {
  const [row]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
  if(!row) throw new TRPCError({code:"PRECONDITION_FAILED",message:"Scheduling setup is required."});
}
async function audit(tx:any,enrollmentId:number,authorId:number,content:string) {
  await tx.insert(studentFileEntries).values({enrollmentId,authorId,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,content});
}
async function activeEnrollment(tx:any,enrollmentId:number) {
  const [row]=await tx.select().from(enrollments).where(eq(enrollments.id,enrollmentId)).limit(1);
  if(!row || row.yearLevel!=="year5-6" || row.tier!=="elite" || row.status!=="active" ||
    row.paymentStatus!=="paid" || !row.courseId || !row.studentId || !row.acceptedAt || !row.activatedAt ||
    row.acceptedAt.getTime()>Date.now() || row.activatedAt.getTime()>Date.now() ||
    !accessPeriodOpen(row.tier,row.accessEndsAt,Date.now()))
    throw new TRPCError({code:"PRECONDITION_FAILED",message:"An active, paid Elite enrolment is required."});
  return row;
}
async function invite(tx:any,input:z.infer<typeof familyInput>) {
  const [row]=await tx.select().from(eliteFamilyInvites).where(eq(eliteFamilyInvites.enrollmentId,input.enrollmentId)).limit(1);
  if(!row || row.tokenHash!==createHash("sha256").update(input.token).digest("hex") || row.expiresAt.getTime()<=Date.now())
    throw new TRPCError({code:"NOT_FOUND",message:"This family scheduling link is unavailable or expired. Contact Schrool."});
  return {...await activeEnrollment(tx,input.enrollmentId), schedulingIssuedBy:row.issuedBy};
}
async function calendar(tx:any,row:any,input:z.infer<typeof bookingInput>) {
  const course: {id:number;title:string|null}[]=await tx.select({id:lessons.id,title:lessons.title}).from(lessons)
    .where(eq(lessons.courseId,row.courseId)).orderBy(asc(lessons.orderIndex),asc(lessons.id));
  let schedule;
  try { schedule=buildTeachingSchedule(input.weekStart,input.timezone,input.slots,
    course.filter(l=>l.title?.trim().toLowerCase()!=="access verification").map(l=>l.id)); }
  catch(error) { throw new TRPCError({code:"BAD_REQUEST",message:error instanceof Error?error.message:"Invalid schedule."}); }
  if(schedule[0].startsAt.getTime()<=Date.now() || Date.parse(input.weekStart+"T00:00:00Z")>Date.now()+183*86400000)
    throw new TRPCError({code:"BAD_REQUEST",message:"Choose a future first teaching week starting within six months."});
  return schedule;
}
async function matching(tx:any,schedule:ReturnType<typeof buildTeachingSchedule>,studentId:number) {
  const profiles=await tx.select({teacherId:eliteTutors.teacherId,timezone:eliteTutors.timezone,
    windowsJson:eliteTutors.windowsJson,commitmentAt:eliteTutors.commitmentAt}).from(eliteTutors)
    .innerJoin(users,eq(users.id,eliteTutors.teacherId)).where(and(eq(eliteTutors.approved,true),
      eq(users.role,"teacher"),eq(users.accountStatus,"active"))).orderBy(asc(eliteTutors.teacherId));
  const booked: typeof eliteTeachingSessions.$inferSelect[]=await tx.select().from(eliteTeachingSessions);
  // This optional legacy table was not installed in the rebuilt staging DB.
  // Preserve conflicts when it exists, without requiring it for new scheduling.
  const { zoomSessions }=await import("../../drizzle/schema.js");
  const [legacyTables]=await tx.execute(sql`SELECT TABLE_NAME FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'zoom_sessions'`);
  const legacy=legacyTables.length ? await tx.select().from(zoomSessions) : [];
  return profiles.filter((profile:any)=>{
    if(!profile.commitmentAt) return false;
    let windows:AvailabilityWindow[];
    try { windows=windowsSchema.parse(JSON.parse(profile.windowsJson)); } catch { return false; }
    return schedule.every(session=>covered(session.startsAt,session.endsAt,profile.timezone,windows) &&
      !booked.some(b=>(b.teacherId===profile.teacherId || b.studentId===studentId) &&
        b.status!=="cancelled" && overlaps(session,b)) &&
      !legacy.some((b:any)=>(b.teacherId===profile.teacherId || b.studentId===studentId) &&
        b.status!=="cancelled" && b.scheduledAt && overlaps(session,{startsAt:b.scheduledAt,
          endsAt:new Date(b.scheduledAt.getTime()+(b.duration||60)*60000)})));
  });
}
async function scheduleView(db:any,enrollmentId:number) {
  const [allocation]=await db.select({teacherId:eliteAllocations.teacherId,tutorName:users.name,
    timezone:eliteAllocations.timezone,weekStart:eliteAllocations.weekStart,slotsJson:eliteAllocations.slotsJson})
    .from(eliteAllocations).innerJoin(users,eq(users.id,eliteAllocations.teacherId))
    .where(eq(eliteAllocations.enrollmentId,enrollmentId)).limit(1);
  const sessions=await db.select({id:eliteTeachingSessions.id,sequence:eliteTeachingSessions.sequence,
    lessonId:eliteTeachingSessions.lessonId,lessonTitle:lessons.title,startsAt:eliteTeachingSessions.startsAt,
    endsAt:eliteTeachingSessions.endsAt,status:eliteTeachingSessions.status})
    .from(eliteTeachingSessions).innerJoin(lessons,eq(lessons.id,eliteTeachingSessions.lessonId))
    .where(eq(eliteTeachingSessions.enrollmentId,enrollmentId)).orderBy(asc(eliteTeachingSessions.startsAt),asc(eliteTeachingSessions.sequence));
  return {allocation:allocation??null,sessions};
}
const replacementKey=z.object({replacementId:id,token:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export const eliteSchedulingRouter=router({
  ...replacementProcedures(),
  registerTutor:admin.input(z.object({name:z.string().trim().min(2).max(255),email:z.string().trim().email().max(255).transform(v=>v.toLowerCase())}).strict()).mutation(async({ctx,input})=>{
    origin(ctx);const db=await getDb();
    return db.transaction(async(tx:any)=>{
      await lock(tx);
      const [existing]=await tx.select().from(users).where(eq(users.email,input.email)).limit(1);
      if(existing) {
        if(existing.role!=="teacher" || existing.accountStatus!=="active") throw new TRPCError({code:"CONFLICT",message:"This email already belongs to another account. Use a separate tutor email."});
        return {teacherId:existing.id};
      }
      const [result]=await tx.insert(users).values({name:input.name,email:input.email,role:"teacher",accountStatus:"active"});
      return {teacherId:Number(result.insertId)};
    });
  }),
  tutors:admin.query(async()=> {
    const db=await getDb();
    return db.select({id:users.id,name:users.name,email:users.email,approved:eliteTutors.approved,
      commitmentAt:eliteTutors.commitmentAt}).from(users).leftJoin(eliteTutors,eq(users.id,eliteTutors.teacherId))
      .where(and(eq(users.role,"teacher"),eq(users.accountStatus,"active"))).orderBy(asc(users.id));
  }),
  approveTutor:admin.input(z.object({teacherId:id,approved:z.boolean()})).mutation(async({ctx,input})=>{
    origin(ctx);const db=await getDb();
    await db.transaction(async(tx:any)=>{
      await lock(tx);
      const [user]=await tx.select().from(users).where(eq(users.id,input.teacherId)).limit(1);
      if(user?.role!=="teacher" || user.accountStatus!=="active") throw new TRPCError({code:"BAD_REQUEST",message:"An active tutor account is required."});
      await tx.insert(eliteTutors).values({teacherId:user.id,approved:input.approved,approvedBy:ctx.user.id,windowsJson:"[]"})
        .onDuplicateKeyUpdate({set:{approved:input.approved,approvedBy:ctx.user.id}});
    });return {saved:true};
  }),
  myAvailability:teacher.query(async({ctx})=>{
    const db=await getDb();const [profile]=await db.select().from(eliteTutors).where(eq(eliteTutors.teacherId,ctx.user.id)).limit(1);
    return profile?{approved:profile.approved,timezone:profile.timezone,windows:JSON.parse(profile.windowsJson) as AvailabilityWindow[],committed:!!profile.commitmentAt}:null;
  }),
  saveAvailability:teacher.input(z.object({timezone,windows:windowsSchema,commitsToCourse:z.literal(true)}).strict())
    .mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();
      await db.transaction(async(tx:any)=>{
        await lock(tx);
        const [profile]=await tx.select().from(eliteTutors).where(eq(eliteTutors.teacherId,ctx.user.id)).limit(1);
        if(!profile?.approved) throw new TRPCError({code:"FORBIDDEN",message:"Admin must approve you for this course first."});
        const booked: typeof eliteTeachingSessions.$inferSelect[]=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.teacherId,ctx.user.id));
        if(booked.some(b=>b.status!=="cancelled" && b.endsAt.getTime()>Date.now() && !covered(b.startsAt,b.endsAt,input.timezone,input.windows)))
          throw new TRPCError({code:"CONFLICT",message:"These hours would break an existing teaching commitment. Contact Admin."});
        await tx.update(eliteTutors).set({timezone:input.timezone,windowsJson:JSON.stringify(input.windows),commitmentAt:new Date()})
          .where(eq(eliteTutors.teacherId,ctx.user.id));
      });return {saved:true};
    }),
  createFamilyLink:admin.input(z.object({enrollmentId:id})).mutation(async({ctx,input})=>{
    origin(ctx);const db=await getDb();
    return db.transaction(async(tx:any)=>{
      await lock(tx);const row=await activeEnrollment(tx,input.enrollmentId);
      const token=randomBytes(32).toString("hex"),expiresAt=new Date(Date.now()+7*86400000);
      await tx.insert(eliteFamilyInvites).values({enrollmentId:row.id,issuedBy:ctx.user.id,tokenHash:createHash("sha256").update(token).digest("hex"),expiresAt})
        .onDuplicateKeyUpdate({set:{issuedBy:ctx.user.id,tokenHash:createHash("sha256").update(token).digest("hex"),expiresAt}});
      await audit(tx,row.id,ctx.user.id,"A private family scheduling link was issued. Valid for seven days; any previous link was replaced.");
      return {url:getSignInOrigin()+"/elite/schedule#"+new URLSearchParams({enrollmentId:String(row.id),token}).toString(),expiresAt};
    });
  }),
  familyDetails:publicProcedure.input(familyInput).mutation(async({ctx,input})=>{
    origin(ctx);ctx.res.setHeader("Cache-Control","no-store");const db=await getDb();const row=await invite(db,input);
    const snapshot=enrollmentSnapshotSchema.parse(JSON.parse(row.agreementSnapshot));
    return {studentName:row.studentName,preferences:snapshot.zoomPreferences,...await scheduleView(db,row.id)};
  }),
  checkTimes:publicProcedure.input(bookingInput).mutation(async({ctx,input})=>{
    origin(ctx);ctx.res.setHeader("Cache-Control","no-store");const db=await getDb();const row=await invite(db,input);
    const sessions=await calendar(db,row,input);const tutors=await matching(db,sessions,row.studentId);
    return {available:tutors.length>0,sessions:sessions.map(s=>({sequence:s.sequence,startsAt:s.startsAt,endsAt:s.endsAt}))};
  }),
  book:publicProcedure.input(bookingInput.extend({parentName:z.string().trim().min(2).max(255),confirmsTimes:z.literal(true)}).strict())
    .mutation(async({ctx,input})=>{
      origin(ctx);ctx.res.setHeader("Cache-Control","no-store");const db=await getDb();
      return db.transaction(async(tx:any)=>{
        await lock(tx);const row=await invite(tx,input);
        const [existing]=await tx.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,row.id)).limit(1);
        if(existing) {
          if(existing.weekStart!==input.weekStart || existing.timezone!==input.timezone || existing.slotsJson!==JSON.stringify(input.slots))
            throw new TRPCError({code:"CONFLICT",message:"A schedule is already confirmed. Contact Schrool for changes."});
          return {booked:true};
        }
        const sessions=await calendar(tx,row,input),profiles=await matching(tx,sessions,row.studentId);
        if(!profiles.length) throw new TRPCError({code:"CONFLICT",message:"No tutor can cover both times for the full course. Choose other times or contact Schrool."});
        const tutor=profiles[0];
        await tx.insert(eliteAllocations).values({enrollmentId:row.id,teacherId:tutor.teacherId,timezone:input.timezone,
          weekStart:input.weekStart,slotsJson:JSON.stringify(input.slots),parentName:input.parentName,parentConfirmedAt:new Date(),tutorCommitmentAt:tutor.commitmentAt});
        await tx.insert(eliteTeachingSessions).values(sessions.map(s=>({...s,enrollmentId:row.id,studentId:row.studentId,
          teacherId:tutor.teacherId,status:"scheduled"})));
        // The family acts via a private link. Use its Admin issuer as the file
        // author and explicitly identify the parent's confirmation.
        await audit(tx,row.id,row.schedulingIssuedBy,
          "Family schedule confirmed by "+input.parentName+". Automatically allocated tutor ID "+tutor.teacherId+
          ". 46 one-hour sessions; two weekly across 23 teaching weeks. Time zone: "+input.timezone+". Two internal reserve sessions are excluded.");
        return {booked:true};
      });
    }),
  enrollmentSchedule:read.input(z.object({enrollmentId:id})).query(async({ctx,input})=>{
    const db=await getDb();const [row]=await db.select().from(enrollments).where(eq(enrollments.id,input.enrollmentId)).limit(1);
    const [allocation]=await db.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,input.enrollmentId)).limit(1);
    if(!row || !(ctx.user.role==="admin" || ctx.user.role==="student" && row.studentId===ctx.user.id ||
      ctx.user.role==="teacher" && allocation?.teacherId===ctx.user.id)) throw new TRPCError({code:"FORBIDDEN",message:"This schedule is unavailable."});
    return scheduleView(db,row.id);
  }),
  mySessions:teacher.input(z.object({page:z.number().int().min(0).max(10000)})).query(async({ctx,input})=>{
    const db=await getDb();
    const rows=await db.select({id:eliteTeachingSessions.id,enrollmentId:eliteTeachingSessions.enrollmentId,sequence:eliteTeachingSessions.sequence,
      studentName:enrollments.studentName,lessonTitle:lessons.title,startsAt:eliteTeachingSessions.startsAt,
      endsAt:eliteTeachingSessions.endsAt,status:eliteTeachingSessions.status}).from(eliteTeachingSessions)
      .innerJoin(enrollments,eq(enrollments.id,eliteTeachingSessions.enrollmentId))
      .innerJoin(lessons,eq(lessons.id,eliteTeachingSessions.lessonId)).where(eq(eliteTeachingSessions.teacherId,ctx.user.id))
      .orderBy(asc(eliteTeachingSessions.startsAt),asc(eliteTeachingSessions.id)).limit(101).offset(input.page*100);
    return {rows:rows.slice(0,100),hasMore:rows.length>100};
  }),
  reports:read.input(z.object({enrollmentId:id})).query(async({ctx,input})=>{
    const db=await getDb();
    const [allocation]=await db.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,input.enrollmentId)).limit(1);
    if(ctx.user.role!=="admin" && !(ctx.user.role==="teacher" && allocation?.teacherId===ctx.user.id))
      throw new TRPCError({code:"FORBIDDEN",message:"Teaching reports are unavailable."});
    return db.select({id:eliteSessionReports.id,sessionId:eliteSessionReports.sessionId,sequence:eliteTeachingSessions.sequence,
      author:users.name,createdAt:eliteSessionReports.createdAt,revisionOf:eliteSessionReports.revisionOf,
      lessonUnderstanding:eliteSessionReports.lessonUnderstanding,nextObjectives:eliteSessionReports.nextObjectives,
      progressDifficulties:eliteSessionReports.progressDifficulties,assignedWork:eliteSessionReports.assignedWork,
      tutorComments:eliteSessionReports.tutorComments}).from(eliteSessionReports)
      .innerJoin(eliteTeachingSessions,eq(eliteTeachingSessions.id,eliteSessionReports.sessionId))
      .innerJoin(users,eq(users.id,eliteSessionReports.authorId)).where(eq(eliteTeachingSessions.enrollmentId,input.enrollmentId))
      .orderBy(desc(eliteSessionReports.id)).limit(200);
  }),
  submitReport:teacher.input(reportFields.extend({sessionId:id,requestId:z.string().uuid(),revisionOf:id.optional(),confirmsDelivered:z.literal(true)}))
    .mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();
      return db.transaction(async(tx:any)=>{
        await lock(tx);
        const [session]=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.id,input.sessionId)).limit(1);
        if(!session || session.teacherId!==ctx.user.id) throw new TRPCError({code:"FORBIDDEN",message:"This session is not assigned to you."});
        if(!["scheduled","delivered"].includes(session.status)) throw new TRPCError({code:"CONFLICT",message:"A missed or cancelled hour cannot be reported as delivered. Open the replacement booking."});
        if(!reportReady(session.startsAt,session.endsAt)) throw new TRPCError({code:"PRECONDITION_FAILED",message:"Submit the report after the session has ended."});
        const [row]=await tx.select().from(enrollments).where(eq(enrollments.id,session.enrollmentId)).limit(1);
        if(!row || row.tier!=="elite" || !["active","completed"].includes(row.status))
          throw new TRPCError({code:"PRECONDITION_FAILED",message:"This enrolment is unavailable for reporting."});
        const fields=reportFields.parse({lessonUnderstanding:input.lessonUnderstanding,nextObjectives:input.nextObjectives,progressDifficulties:input.progressDifficulties,assignedWork:input.assignedWork,tutorComments:input.tutorComments});
        const [retry]=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.requestId,input.requestId)).limit(1);
        if(retry) {
          if(retry.sessionId!==session.id || retry.authorId!==ctx.user.id ||
            retry.revisionOf!==(input.revisionOf??null) || Object.entries(fields).some(([key,value])=>retry[key]!==value))
            throw new TRPCError({code:"CONFLICT",message:"This report reference has already been used."});
          return {saved:true};
        }
        if(session.status==="scheduled") {
          const unresolved=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,session.enrollmentId));
          const bookings=await replacementBookings(tx,session.enrollmentId);
          const pending=nextReplacement(unresolved,bookings);
          if(pending && !(pending.status==="approved" && pending.replacementId===session.id))
            throw new TRPCError({code:"PRECONDITION_FAILED",message:"Approve and deliver the earlier missed-hour catch-up before progressing to this lesson."});
        }
        const [latest]=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.sessionId,session.id))
          .orderBy(desc(eliteSessionReports.id)).limit(1);
        if((latest?.id??undefined)!==input.revisionOf || latest && latest.authorId!==ctx.user.id)
          throw new TRPCError({code:"CONFLICT",message:"Load the latest report before adding a correction."});
        await tx.insert(eliteSessionReports).values({...fields,sessionId:session.id,authorId:ctx.user.id,requestId:input.requestId,revisionOf:input.revisionOf??null});
        await tx.update(eliteTeachingSessions).set({status:"delivered"}).where(eq(eliteTeachingSessions.id,session.id));
        const replacementCases=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,session.enrollmentId));
        let deliveredId=session.id;
        const settled=new Set<number>();
        while(true) {
          const replacement=replacementCases.find((c:any)=>c.replacementId===deliveredId && c.status==="approved" && !settled.has(c.id));
          if(!replacement)break;settled.add(replacement.id);
          await tx.update(eliteReplacements).set({status:"delivered",billingStatus:replacement.feeCents ? "due" : "internal"}).where(eq(eliteReplacements.id,replacement.id));
          await audit(tx,row.id,ctx.user.id,"Replacement #"+replacement.id+" fulfilled by delivered booking #"+session.id+" for missed booking #"+replacement.originalId+". "+(replacement.feeCents?"AUD $80 now due; Admin to debit or issue a seven-day invoice. No automatic payment has been taken.":"Approved internal reserve hour; tutor payment requires Admin processing."));
          deliveredId=replacement.originalId;
        }
        await audit(tx,row.id,ctx.user.id,"Five-part tutor session report "+(input.revisionOf?"correction":"submitted")+
          " for teaching session "+session.sequence+". Original report history retained.");
        return {saved:true};
      });
    }),
});

async function replacementBookings(db:any,enrollmentId:number) {
  return db.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollmentId));
}
async function replacementToken(db:any,input:z.infer<typeof replacementKey>) {
  const [row]=await db.select().from(eliteReplacements).where(eq(eliteReplacements.id,input.replacementId)).limit(1);
  if(!row || row.tokenHash!==createHash("sha256").update(input.token).digest("hex") || !row.expiresAt || +row.expiresAt<=Date.now())
    throw new TRPCError({code:"NOT_FOUND",message:"This replacement approval link is unavailable or expired. Ask the tutor for a new link."});
  await activeEnrollment(db,row.enrollmentId);
  return row;
}
async function replacementConflict(tx:any,sessions:{startsAt:Date;endsAt:Date}[],teacherId:number,studentId:number) {
  const [profile]=await tx.select({approved:eliteTutors.approved,timezone:eliteTutors.timezone,windowsJson:eliteTutors.windowsJson,commitmentAt:eliteTutors.commitmentAt,accountStatus:users.accountStatus}).from(eliteTutors).innerJoin(users,eq(users.id,eliteTutors.teacherId)).where(eq(eliteTutors.teacherId,teacherId)).limit(1);
  if(!profile?.approved || profile.accountStatus!=="active" || !profile.commitmentAt)
    throw new TRPCError({code:"CONFLICT",message:"The committed tutor must remain active and approved."});
  const tutor=profile;
  const windows=windowsSchema.parse(JSON.parse(tutor.windowsJson));
  const booked=await tx.select().from(eliteTeachingSessions);
  const {zoomSessions}=await import("../../drizzle/schema.js");
  const [tables]=await tx.execute(sql`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='zoom_sessions'`);
  const legacy=tables.length?await tx.select().from(zoomSessions):[];
  if(sessions.some(s=>!covered(s.startsAt,s.endsAt,tutor.timezone,windows) || booked.some((b:any)=>
    b.status!=="cancelled" && (b.teacherId===teacherId || b.studentId===studentId) && overlaps(s,b)) || legacy.some((b:any)=>
      b.status!=="cancelled" && b.scheduledAt && (b.teacherId===teacherId || b.studentId===studentId) && overlaps(s,{startsAt:b.scheduledAt,endsAt:new Date(+b.scheduledAt+(b.duration||60)*60000)}))))
    throw new TRPCError({code:"CONFLICT",message:"The additional hour must fit the tutor's committed availability and have no tutor or student booking conflict."});
}
function replacementProcedures() {
  return {
    recordMissed:teacher.input(z.object({sessionId:id,reason:z.enum(["illness","school","family","no_show","bereavement","accident","hospitalisation"]),note:text,
      confirmsWaiting:z.literal(true),parentAuthorisedEarlyDeparture:z.boolean()}).strict()).mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();return db.transaction(async(tx:any)=>{
        await lock(tx);
        const [session]=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.id,input.sessionId)).limit(1);
        if(!session || session.teacherId!==ctx.user.id) throw new TRPCError({code:"FORBIDDEN",message:"Open your own teaching booking."});
        await activeEnrollment(tx,session.enrollmentId);
        const [existing]=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.originalId,session.id)).limit(1);
        if(existing) return {replacementId:existing.id};
        if(session.status!=="scheduled" || +session.endsAt>Date.now()) throw new TRPCError({code:"PRECONDITION_FAILED",message:"Record a missed hour after its scheduled end. Delivered sessions cannot be changed to missed."});
        const [report]=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.sessionId,session.id)).limit(1);
        if(report) throw new TRPCError({code:"CONFLICT",message:"This booking already has a delivery report."});
        const exceptional=["bereavement","accident","hospitalisation"].includes(input.reason);
        const [result]=await tx.insert(eliteReplacements).values({originalId:session.id,enrollmentId:session.enrollmentId,teacherId:ctx.user.id,
          reason:input.reason,note:input.note,waitingConfirmed:true,status:exceptional?"admin_review":"awaiting_plan"});
        await tx.update(eliteTeachingSessions).set({status:"missed"}).where(eq(eliteTeachingSessions.id,session.id));
        await audit(tx,session.enrollmentId,ctx.user.id,"Missed booking #"+session.id+" recorded. Tutor confirms availability until scheduled end"+
          (input.parentAuthorisedEarlyDeparture?", or earlier departure expressly authorised by the parent":"")+". Reserved tutor hour remains payable. Reason: "+input.reason+". "+input.note+
          (exceptional?" Admin review required for exceptional internal reserve use.":" Replacement requires parent approval of AUD $80; fee is due after delivery."));
        return {replacementId:Number(result.insertId)};
      });
    }),
    replacementCases:read.input(z.object({enrollmentId:id})).query(async({ctx,input})=>{
      const db=await getDb();const [allocation]=await db.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,input.enrollmentId)).limit(1);
      if(ctx.user.role!=="admin" && !(ctx.user.role==="teacher" && allocation?.teacherId===ctx.user.id)) throw new TRPCError({code:"FORBIDDEN"});
      const rows=await db.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,input.enrollmentId)).orderBy(desc(eliteReplacements.id));
      return rows.map(({tokenHash, ...r}:typeof eliteReplacements.$inferSelect)=>({...r,plan:r.planJson?JSON.parse(r.planJson) as ReplacementPlan:null}));
    }),
    reviewReplacement:admin.input(z.object({replacementId:id,funding:z.enum(["parent","internal_reserve"]),evidence:text}).strict()).mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();await db.transaction(async(tx:any)=>{
        await lock(tx);const [row]=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.id,input.replacementId)).limit(1);
        if(!row || row.status!=="admin_review") throw new TRPCError({code:"CONFLICT",message:"This case is not awaiting Admin review."});
        if(input.funding==="internal_reserve") {
          if(!["bereavement","accident","hospitalisation"].includes(row.reason)) throw new TRPCError({code:"FORBIDDEN",message:"Ordinary absences do not qualify for internal reserve hours."});
          const used=await tx.select().from(eliteReplacements).where(and(eq(eliteReplacements.enrollmentId,row.enrollmentId),eq(eliteReplacements.funding,"internal_reserve")));
          if(used.length>=2) throw new TRPCError({code:"CONFLICT",message:"The two internal reserve hours have already been allocated."});
        }
        await tx.update(eliteReplacements).set({status:"awaiting_plan",funding:input.funding,feeCents:input.funding==="parent"?8000:0,reviewedBy:ctx.user.id}).where(eq(eliteReplacements.id,row.id));
        await audit(tx,row.enrollmentId,ctx.user.id,"Replacement #"+row.id+" reviewed: "+input.funding+". Tutor remains payable. Evidence: "+input.evidence);
      });return {saved:true};
    }),
    proposeReplacement:teacher.input(z.object({replacementId:id,mode:z.enum(["extra","next_regular"]),extraAt:z.string().datetime()}).strict()).mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();return db.transaction(async(tx:any)=>{
        await lock(tx);const [row]=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.id,input.replacementId)).limit(1);
        if(!row || row.teacherId!==ctx.user.id) throw new TRPCError({code:"FORBIDDEN"});
        if(!["awaiting_plan","proposed"].includes(row.status)) throw new TRPCError({code:"CONFLICT",message:"This case is not ready for a proposal."});
        const enrollment=await activeEnrollment(tx,row.enrollmentId);
        const bookings=await replacementBookings(tx,row.enrollmentId);
        const cases=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,row.enrollmentId));
        if(nextReplacement(cases,bookings)?.id!==row.id) throw new TRPCError({code:"PRECONDITION_FAILED",message:"Arrange the earlier unfinished catch-up first to preserve lesson order."});
        let plan:ReplacementPlan;
        try{plan=replacementPlan(bookings,row.originalId,input.mode,new Date(input.extraAt));}catch(e){throw new TRPCError({code:"BAD_REQUEST",message:(e as Error).message});}
        await replacementConflict(tx,plan.additions.map(s=>({startsAt:new Date(s.startsAt),endsAt:new Date(s.endsAt)})),row.teacherId,enrollment.studentId);
        const token=randomBytes(32).toString("hex"),expiresAt=new Date(Date.now()+7*86400000);
        await tx.update(eliteReplacements).set({status:"proposed",planJson:JSON.stringify(plan),tokenHash:createHash("sha256").update(token).digest("hex"),expiresAt}).where(eq(eliteReplacements.id,row.id));
        await audit(tx,row.enrollmentId,ctx.user.id,"Replacement #"+row.id+" proposed; mode "+input.mode+". Parent approval requested for all lesson changes and "+(row.feeCents?"AUD $80 after delivery":"no additional parent fee")+". No time reserved yet.");
        return {url:getSignInOrigin()+"/elite/schedule#"+new URLSearchParams({replacementId:String(row.id),token}).toString()};
      });
    }),
    replacementDetails:publicProcedure.input(replacementKey).mutation(async({ctx,input})=>{
      origin(ctx);ctx.res.setHeader("Cache-Control","no-store");const db=await getDb();const row=await replacementToken(db,input);
      const [enrollment]=await db.select().from(enrollments).where(eq(enrollments.id,row.enrollmentId)).limit(1);
      const schedule=await scheduleView(db,row.enrollmentId);
      return {id:row.id,status:row.status,studentName:enrollment.studentName,feeCents:row.feeCents,billingStatus:row.billingStatus,
        originalId:row.originalId,replacementId:row.replacementId,plan:row.planJson?JSON.parse(row.planJson) as ReplacementPlan:null,...schedule};
    }),
    approveReplacement:publicProcedure.input(replacementKey.extend({parentName:z.string().trim().min(2).max(255),confirmsTimesAndFee:z.literal(true)}).strict()).mutation(async({ctx,input})=>{
      origin(ctx);ctx.res.setHeader("Cache-Control","no-store");const db=await getDb();return db.transaction(async(tx:any)=>{
        await lock(tx);const row=await replacementToken(tx,input);
        if(["approved","delivered"].includes(row.status)) return {saved:true};
        if(row.status!=="proposed" || !row.planJson) throw new TRPCError({code:"CONFLICT",message:"A current tutor proposal is required."});
        const bookings=await replacementBookings(tx,row.enrollmentId),stored=JSON.parse(row.planJson) as ReplacementPlan;
        if(stored.fingerprint!==bookingFingerprint(bookings)) throw new TRPCError({code:"CONFLICT",message:"The teaching record changed. Ask the tutor to refresh this proposal before approving."});
        let plan:ReplacementPlan;
        try{plan=replacementPlan(bookings,row.originalId,stored.mode,new Date(stored.additions[0].startsAt));}catch(e){throw new TRPCError({code:"CONFLICT",message:(e as Error).message});}
        const enrollment=await activeEnrollment(tx,row.enrollmentId);
        await replacementConflict(tx,plan.additions.map(s=>({startsAt:new Date(s.startsAt),endsAt:new Date(s.endsAt)})),row.teacherId,enrollment.studentId);
        for(const change of plan.changes) await tx.update(eliteTeachingSessions).set({lessonId:change.lessonId}).where(eq(eliteTeachingSessions.id,change.id));
        const added=plan.additions[0];const [result]=await tx.insert(eliteTeachingSessions).values({...added,startsAt:new Date(added.startsAt),endsAt:new Date(added.endsAt),
          enrollmentId:row.enrollmentId,teacherId:row.teacherId,studentId:enrollment.studentId,status:"scheduled"});
        await tx.update(eliteReplacements).set({status:"approved",parentName:input.parentName,approvedAt:new Date(),replacementId:plan.replacementId??Number(result.insertId)}).where(eq(eliteReplacements.id,row.id));
        await audit(tx,row.enrollmentId,row.teacherId,"Replacement #"+row.id+" approved by parent/guardian "+input.parentName+". "+(row.feeCents?"AUD $80 due after delivery; seven-day invoice or authorised debit handled by Admin.":"No additional parent fee; internal reserve authorised by Admin.")+" Additional hour: "+added.startsAt+". Lesson changes: "+JSON.stringify(plan.changes)+". Original booking retained and tutor remains payable.");
        return {saved:true};
      });
    }),
    replacementBilling:admin.input(z.object({replacementId:id,status:z.enum(["invoiced","paid"]),reference:z.string().trim().min(3).max(255)}).strict()).mutation(async({ctx,input})=>{
      origin(ctx);const db=await getDb();await db.transaction(async(tx:any)=>{
        await lock(tx);const [row]=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.id,input.replacementId)).limit(1);
        if(!row || row.status!=="delivered" || row.feeCents!==8000) throw new TRPCError({code:"PRECONDITION_FAILED",message:"The approved paid replacement must be delivered first."});
        if(row.billingStatus===input.status && row.billingReference===input.reference) return;
        if(row.billingStatus==="paid" || input.status==="invoiced" && row.billingStatus!=="due") throw new TRPCError({code:"CONFLICT",message:"This billing record cannot be moved backwards."});
        await tx.update(eliteReplacements).set({billingStatus:input.status,billingReference:input.reference}).where(eq(eliteReplacements.id,row.id));
        await audit(tx,row.enrollmentId,ctx.user.id,"Replacement #"+row.id+" AUD $80 marked "+input.status+" by Admin. External invoice/payment reference: "+input.reference+". This action records an existing invoice/payment; it does not collect funds.");
      });return {saved:true};
    }),
  };
}
