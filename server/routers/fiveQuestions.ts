import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { requireCourseAccess } from "../_core/courseAccess.js";
import { accessPeriodOpen } from "../../shared/courseAccessPeriod.js";
import { draftWork, submittedWork, emptyWork } from "../../shared/fiveQuestions.js";
import { approvalRequirements, fiveCourse, requireFiveLesson } from "../fiveQuestionAccess.js";
import { parentEnrollment } from "../parentRecords.js";
import { enrollments, users, eliteAllocations, eliteTutors, eliteScheduleLock,
  fiveQuestionDrafts as drafts, fiveQuestionSubmissions as submissions, fiveQuestionReviews as reviews } from "../../drizzle/schema.js";

const id=z.number().int().positive().safe();
const lessonInput=z.object({enrollmentId:id,lessonId:id}).strict();
const read=protectedProcedure.use(({ctx,next})=>{
  ctx.res.setHeader("Cache-Control","no-store");
  if(ctx.user.accountStatus!=="active")throw new TRPCError({code:"FORBIDDEN",message:"Active account required."});
  return next();
});
const change=read.use(({ctx,next})=>{
  if(ctx.req.headers.origin!==getSignInOrigin())throw new TRPCError({code:"FORBIDDEN",message:"Invalid request origin."});
  return next();
});
function deny():never {throw new TRPCError({code:"NOT_FOUND",message:"Five-question work unavailable."});}
function active(row:any) {
  const now=Date.now();
  if(!row || row.status!=="active" || row.paymentStatus!=="paid" || !row.studentId || !row.courseId ||
    !row.acceptedAt || !row.activatedAt || +row.acceptedAt>now || +row.activatedAt>now || !accessPeriodOpen(row.tier,row.accessEndsAt,now))
    throw new TRPCError({code:"FORBIDDEN",message:"Active paid course access required."});
}
async function permission(db:any,user:any,enrollmentId:number,writing=false) {
  if(!["student","teacher","parent","admin"].includes(user.role))deny();
  const row=user.role==="parent"?await parentEnrollment(db,user.id,enrollmentId):
    (await db.select().from(enrollments).where(eq(enrollments.id,enrollmentId)).limit(1))[0];
  if(!row || row.yearLevel!=="year5-6" || row.tier!=="elite" || !row.studentId || !row.courseId)deny();
  if(user.role==="student") {
    if(row.studentId!==user.id)deny();
    await requireCourseAccess(user,enrollmentId);
    active(row);
  }
  if(user.role==="teacher") {
    const [allocation]=await db.select().from(eliteAllocations).where(and(eq(eliteAllocations.enrollmentId,enrollmentId),eq(eliteAllocations.teacherId,user.id)));
    const [tutor]=await db.select().from(eliteTutors).where(eq(eliteTutors.teacherId,user.id));
    if(!allocation || !tutor?.approved || !tutor.commitmentAt)deny();
    if(writing)active(row);
  }
  if(writing && !["student","teacher"].includes(user.role))deny();
  return row;
}
async function lock(db:any,enrollmentId:number) {
  const [guard]=await db.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
  if(!guard)throw new TRPCError({code:"PRECONDITION_FAILED",message:"Scheduling setup required."});
  await db.select().from(enrollments).where(eq(enrollments.id,enrollmentId)).for("update");
}
async function latest(db:any,input:z.infer<typeof lessonInput>,studentId:number) {
  const [row]=await db.select({id:submissions.id,createdAt:submissions.createdAt,decision:reviews.decision,feedback:reviews.feedback})
    .from(submissions).leftJoin(reviews,eq(reviews.submissionId,submissions.id))
    .where(and(eq(submissions.enrollmentId,input.enrollmentId),eq(submissions.lessonId,input.lessonId),eq(submissions.studentId,studentId))).orderBy(desc(submissions.id)).limit(1);
  return row??null;
}
function editable(row:any) {
  if(row && row.decision!=="revise")throw new TRPCError({code:"CONFLICT",message:row.decision==="approved"?"This lesson is already approved.":"Wait for your tutor's review before revising."});
}
// Only normalised JPEG photos, bounded in size and dimensions. No remote URLs,
// SVG, HTML, arbitrary file downloads or public media paths are accepted.
export function validatePhoto(photo:string|null) {
  if(photo===null)return;
  if(!/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(photo))throw new Error("Use a JPEG photo prepared by the upload control.");
  const data=Buffer.from(photo.slice(photo.indexOf(",")+1),"base64");
  if(data.length<20 || data[0]!==255 || data[1]!==216 || data.at(-2)!==255 || data.at(-1)!==217)throw new Error("Invalid photo.");
  let offset=2,found=false;
  while(offset+4<data.length) {
    if(data[offset++]!==255)break;
    let marker=data[offset++];while(marker===255)marker=data[offset++];
    if(marker===218 || marker===217)break;
    const length=data.readUInt16BE(offset);if(length<2 || offset+length>data.length)break;
    if([192,193,194].includes(marker)&&length>=8) {
      const height=data.readUInt16BE(offset+3),width=data.readUInt16BE(offset+5);
      if(!height || !width || height>1800 || width>1800)throw new Error("Photo dimensions exceed the limit.");
      found=true;
    }
    offset+=length;
  }
  if(!found)throw new Error("Invalid photo dimensions.");
}
export const fiveQuestionsRouter=router({
  myStudents:read.query(async({ctx})=>{
    if(ctx.user.role!=="teacher")deny();
    const db=await getDb();
    const [tutor]=await db.select().from(eliteTutors).where(eq(eliteTutors.teacherId,ctx.user.id));
    if(!tutor?.approved || !tutor.commitmentAt)return [];
    return db.select({enrollmentId:enrollments.id,studentName:enrollments.studentName}).from(eliteAllocations)
      .innerJoin(enrollments,eq(enrollments.id,eliteAllocations.enrollmentId))
      .where(and(eq(eliteAllocations.teacherId,ctx.user.id),eq(enrollments.yearLevel,"year5-6"),eq(enrollments.tier,"elite"),eq(enrollments.status,"active")))
      .orderBy(asc(enrollments.id));
  }),
  course:read.input(z.object({enrollmentId:id})).query(async({ctx,input})=>{
    const db=await getDb(),row=await permission(db,ctx.user,input.enrollmentId);
    const {course,approved}=await fiveCourse(db,row.id,row.courseId,row.studentId);
    return course.map(l=>({...l,approved:approved.has(l.id)}));
  }),
  history:read.input(lessonInput.extend({page:z.number().int().min(0).max(1000).default(0)})).query(async({ctx,input})=>{
    const db=await getDb(),row=await permission(db,ctx.user,input.enrollmentId);
    const {course}=await fiveCourse(db,row.id,row.courseId,row.studentId);if(!course.some(l=>l.id===input.lessonId))deny();
    const rows=await db.select({id:submissions.id,createdAt:submissions.createdAt,decision:reviews.decision,feedback:reviews.feedback,
      reviewedAt:reviews.createdAt,author:users.name}).from(submissions)
      .leftJoin(reviews,eq(reviews.submissionId,submissions.id)).leftJoin(users,eq(users.id,reviews.authorId))
      .where(and(eq(submissions.enrollmentId,input.enrollmentId),eq(submissions.lessonId,input.lessonId),eq(submissions.studentId,row.studentId)))
      .orderBy(desc(submissions.id)).limit(11).offset(input.page*10);
    return {rows:rows.slice(0,10),hasMore:rows.length>10};
  }),
  submission:read.input(lessonInput.extend({submissionId:id})).query(async({ctx,input})=>{
    const db=await getDb(),owner=await permission(db,ctx.user,input.enrollmentId);
    const [row]=await db.select({workJson:submissions.workJson}).from(submissions).where(and(eq(submissions.id,input.submissionId),
      eq(submissions.enrollmentId,input.enrollmentId),eq(submissions.lessonId,input.lessonId),eq(submissions.studentId,owner.studentId))).limit(1);
    if(!row)deny();return submittedWork.parse(JSON.parse(row.workJson));
  }),
  draft:read.input(lessonInput).query(async({ctx,input})=>{
    if(ctx.user.role!=="student")deny();
    const db=await getDb(),row=await permission(db,ctx.user,input.enrollmentId);
    await requireFiveLesson(db,row,input.lessonId);
    const [draft]=await db.select().from(drafts).where(and(eq(drafts.enrollmentId,input.enrollmentId),eq(drafts.lessonId,input.lessonId)));
    if(draft && draft.studentId!==row.studentId)deny();
    return {version:draft?.version??0,work:draft?draftWork.parse(JSON.parse(draft.workJson)):emptyWork(),latest:await latest(db,input,row.studentId)};
  }),
  saveDraft:change.input(lessonInput.extend({version:z.number().int().min(0),work:draftWork})).mutation(async({ctx,input})=>{
    if(ctx.user.role!=="student")deny();
    try{input.work.forEach(q=>validatePhoto(q.photo));}catch(e){throw new TRPCError({code:"BAD_REQUEST",message:(e as Error).message});}
    const db=await getDb();return db.transaction(async(tx:any)=>{
      await lock(tx,input.enrollmentId);const row=await permission(tx,ctx.user,input.enrollmentId,true);
      await requireFiveLesson(tx,row,input.lessonId);editable(await latest(tx,input,row.studentId));
      const [draft]=await tx.select().from(drafts).where(and(eq(drafts.enrollmentId,input.enrollmentId),eq(drafts.lessonId,input.lessonId)));
      if(draft && draft.studentId!==row.studentId)deny();
      if((draft?.version??0)!==input.version)throw new TRPCError({code:"CONFLICT",message:"This draft changed in another tab. Reload the saved draft before editing."});
      const version=input.version+1,workJson=JSON.stringify(input.work);
      if(draft)await tx.update(drafts).set({version,workJson}).where(eq(drafts.id,draft.id));
      else await tx.insert(drafts).values({enrollmentId:input.enrollmentId,lessonId:input.lessonId,studentId:ctx.user.id,version,workJson});
      return {version};
    });
  }),
  submit:change.input(lessonInput.extend({version:z.number().int().positive(),requestId:z.string().uuid(),confirmsOwnWork:z.literal(true)})).mutation(async({ctx,input})=>{
    if(ctx.user.role!=="student")deny();
    const db=await getDb();return db.transaction(async(tx:any)=>{
      await lock(tx,input.enrollmentId);const row=await permission(tx,ctx.user,input.enrollmentId,true);
      await requireFiveLesson(tx,row,input.lessonId);
      const [retry]=await tx.select().from(submissions).where(eq(submissions.requestId,input.requestId));
      if(retry){if(retry.studentId!==ctx.user.id || retry.enrollmentId!==row.id || retry.lessonId!==input.lessonId)deny();return {id:retry.id};}
      editable(await latest(tx,input,row.studentId));
      const [draft]=await tx.select().from(drafts).where(and(eq(drafts.enrollmentId,row.id),eq(drafts.lessonId,input.lessonId),eq(drafts.studentId,ctx.user.id)));
      if(!draft || draft.version!==input.version)throw new TRPCError({code:"CONFLICT",message:"Save and reload the current draft before submitting."});
      if(!submittedWork.safeParse(JSON.parse(draft.workJson)).success)
        throw new TRPCError({code:"BAD_REQUEST",message:"Include all five questions and their worked answers, typed or in clear photos."});
      await tx.insert(submissions).values({enrollmentId:row.id,lessonId:input.lessonId,studentId:ctx.user.id,requestId:input.requestId,workJson:draft.workJson});
      // Retain the draft and its increasing version to prevent stale-tab overwrites.
      await tx.update(drafts).set({version:draft.version+1}).where(eq(drafts.id,draft.id));
      const saved=await latest(tx,input,row.studentId);return {id:saved.id};
    });
  }),
  requirements:read.input(lessonInput).query(async({ctx,input})=>{
    if(ctx.user.role!=="teacher")deny();const db=await getDb(),row=await permission(db,ctx.user,input.enrollmentId);
    return approvalRequirements(db,row,input.lessonId);
  }),
  review:change.input(lessonInput.extend({submissionId:id,decision:z.enum(["approved","revise"]),feedback:z.string().trim().min(10).max(3000),confirmsReviewed:z.literal(true)}))
    .mutation(async({ctx,input})=>{
      if(ctx.user.role!=="teacher")deny();const db=await getDb();return db.transaction(async(tx:any)=>{
        await lock(tx,input.enrollmentId);const row=await permission(tx,ctx.user,input.enrollmentId,true);
        await requireFiveLesson(tx,row,input.lessonId);
        const current=await latest(tx,input,row.studentId);if(!current || current.id!==input.submissionId)throw new TRPCError({code:"CONFLICT",message:"Review the latest submission."});
        if(current.decision){
          if(current.decision===input.decision && current.feedback===input.feedback)return {saved:true};
          throw new TRPCError({code:"CONFLICT",message:"This review is already recorded. Earlier reviews are preserved."});
        }
        if(input.decision==="approved") {
          const ready=await approvalRequirements(tx,row,input.lessonId);
          if(!ready.exercises || !ready.teaching || !ready.returns)throw new TRPCError({code:"PRECONDITION_FAILED",message:"Approval requires all three exercise passes, two delivered and reported teaching hours, and completed covering handovers."});
        }
        await tx.insert(reviews).values({submissionId:input.submissionId,enrollmentId:row.id,lessonId:input.lessonId,authorId:ctx.user.id,decision:input.decision,feedback:input.feedback});
        return {saved:true};
      });
    }),
});
