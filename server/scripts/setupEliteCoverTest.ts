import { createHash, randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../db.js";
import { users, enrollments, lessons, eliteTutors, eliteScheduleLock, eliteAllocations,
  eliteTeachingSessions, eliteSessionReports, eliteSessionCovers, studentFileEntries } from "../../drizzle/schema.js";
import { addDays, covered, localParts, overlaps, wallTime } from "../../shared/eliteSchedule.js";
import { coverReviewSnapshot } from "../../shared/eliteCover.js";
import { sydneyDate } from "../../shared/standardSupport.js";

const marker="staging-elite-cover-test-v1",name="STAGING COVER TEST ONLY";
// Synthetic eligibility and teaching history only: no customer agreement, actual
// payment, mail, invoice or tutor payment. Pending student has no email or login.
export async function setupEliteCoverTest(mode:"setup"|"allow-report"|"archive"="setup") {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
    !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)throw new Error("Staging configuration required.");
  const db=await getDb();
  return db.transaction(async(tx:any)=>{
    const [lock]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
    if(!lock)throw new Error("Scheduling setup required.");
    const tutors=[];
    for(const email of ["pidialanil+tutor01@gmail.com","pidialanil+cover01@gmail.com"]) {
      const [user]=await tx.select().from(users).where(eq(users.email,email)).limit(1);
      const [profile]=user?await tx.select().from(eliteTutors).where(eq(eliteTutors.teacherId,user.id)).limit(1):[];
      if(user?.role!=="teacher" || user.accountStatus!=="active" || !profile?.approved || !profile.commitmentAt)
        throw new Error("Richard and Jane must both be approved active tutors with saved availability.");
      tutors.push({user,profile});
    }
    const [regular,covering]=tutors;
    const course=await tx.select().from(lessons).where(eq(lessons.courseId,2)).orderBy(asc(lessons.orderIndex),asc(lessons.id));
    const teaching=course.filter((l:any)=>l.title?.trim().toLowerCase()!=="access verification");
    if(teaching.length!==23 || teaching[0].title?.trim().toLowerCase()!=="what is a fraction")throw new Error("Expected 23-lesson teaching course unavailable.");
    let [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    if(!student && mode!=="setup")throw new Error("Create the cover test first.");
    if(!student) {
      await tx.insert(users).values({openId:marker,name,email:null,role:"student",accountStatus:"pending"});
      [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    }
    if(!student || student.openId!==marker || student.name!==name || student.role!=="student" || student.accountStatus!=="pending" || student.email!==null)
      throw new Error("Fixture student identity mismatch.");
    let [enrollment]=await tx.select().from(enrollments).where(and(eq(enrollments.studentId,student.id),eq(enrollments.studentName,name))).limit(1);
    if(!enrollment && mode!=="setup")throw new Error("Create the fixture enrolment first.");
    if(!enrollment) {
      const now=new Date();
      const [created]=await tx.insert(enrollments).values({studentId:student.id,studentName:name,courseId:2,yearLevel:"year5-6",tier:"elite",status:"active",paymentStatus:"paid",
        agreedTotalCents:0,currency:"AUD",paymentPlan:"staging_fixture",termsVersion:marker,parentEmail:null,acceptedAt:now,activatedAt:now,enrolledAt:now,accessEndsAt:null,
        agreementSnapshot:JSON.stringify({stagingFixture:marker,syntheticEligibilityOnly:true,purpose:"Isolated covering tutor handover simulation. No customer payment or accepted agreement."})});
      [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.id,created.insertId)).limit(1);
    }
    if(!enrollment || JSON.parse(enrollment.agreementSnapshot??"null")?.stagingFixture!==marker || enrollment.studentId!==student.id || enrollment.studentName!==name ||
      enrollment.parentEmail!==null || enrollment.agreedTotalCents!==0 || enrollment.termsVersion!==marker || enrollment.courseId!==2 || enrollment.tier!=="elite" ||
      !["active",...(mode==="archive"?["cancelled"]:[])].includes(enrollment.status) || enrollment.paymentStatus!=="paid" || !enrollment.acceptedAt || !enrollment.activatedAt || enrollment.stripeSubscriptionId)
      throw new Error("Fixture enrolment identity mismatch.");
    const bookings=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id)).orderBy(asc(eliteTeachingSessions.sequence));
    const [allocation]=await tx.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,enrollment.id)).limit(1);
    if(allocation && allocation.teacherId!==regular.user.id || bookings.some((s:any)=>s.enrollmentId!==enrollment.id || s.studentId!==student.id ||
      (s.sequence===2?![regular.user.id,covering.user.id].includes(s.teacherId):s.teacherId!==regular.user.id)))throw new Error("Fixture booking ownership mismatch.");
    if(mode!=="setup") {
      if(bookings.length!==3 || !allocation || !bookings.every((s:any,i:number)=>s.sequence===i+1))throw new Error("Expected three isolated fixture bookings.");
      const session=bookings[1];
      const covers=await tx.select().from(eliteSessionCovers).where(eq(eliteSessionCovers.enrollmentId,enrollment.id)).orderBy(desc(eliteSessionCovers.id));
      if(covers.some((c:any)=>c.sessionId!==session.id || c.regularTeacherId!==regular.user.id || c.coverTeacherId!==covering.user.id))throw new Error("Unexpected covering assignment in test fixture.");
      const active=covers.filter((c:any)=>c.status!=="cancelled");
      if(mode==="archive") {
        if(active.some((c:any)=>c.status!=="returned" || !c.returnedReportId || !c.returnedAt))throw new Error("Finish the regular tutor's return review, or cancel future cover, before archiving.");
        if(enrollment.status!=="cancelled") {
          for(const booking of bookings.filter((s:any)=>s.status==="scheduled"))await tx.update(eliteTeachingSessions).set({status:"cancelled"}).where(eq(eliteTeachingSessions.id,booking.id));
          await tx.update(enrollments).set({status:"cancelled",accessEndsAt:new Date()}).where(eq(enrollments.id,enrollment.id));
          await fixtureNote(tx,enrollment.id,regular.user.id,"Fixture archived. Unused test hours released; simulated reports, cover decisions and return review retained. No real teaching or payment.");
        }
        return {enrollmentId:enrollment.id,sessionId:session.id,phase:"archived"};
      }
      const cover=active[0];
      if(active.length!==1 || !cover || cover.status!=="assigned" || !cover.acknowledgedAt || !cover.reviewKey || session.status!=="scheduled" || session.teacherId!==covering.user.id)
        throw new Error("Admin must assign Jane to Session 2 and Jane must acknowledge the current handover first.");
      const priorIds=bookings.filter((s:any)=>+s.startsAt<+session.startsAt).map((s:any)=>s.id);
      const reports=await tx.select({id:eliteSessionReports.id,sessionId:eliteSessionReports.sessionId}).from(eliteSessionReports)
        .where(inArray(eliteSessionReports.sessionId,priorIds)).orderBy(desc(eliteSessionReports.id)).limit(200);
      const key=(s:any)=>createHash("sha256").update(coverReviewSnapshot(s,cover,reports)).digest("hex");
      if(key(session)!==cover.reviewKey)throw new Error("The lesson or prior reports changed. Jane must review and acknowledge the latest handover.");
      const own=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.sessionId,session.id)).limit(1);
      if(own.length)throw new Error("Covering report already exists; use the tutor portal to inspect it.");
      if(+session.endsAt<=Date.now())return {enrollmentId:enrollment.id,sessionId:session.id,phase:"report-ready"};
      const endsAt=new Date(Math.floor(Date.now()/60000)*60000-60000),startsAt=new Date(+endsAt-3600000);
      if(+bookings[0].endsAt>=+startsAt)throw new Error("The test clock must keep the earlier report before the covering hour.");
      await tx.update(eliteTeachingSessions).set({startsAt,endsAt}).where(eq(eliteTeachingSessions.id,session.id));
      await tx.update(eliteSessionCovers).set({reviewKey:key({...session,startsAt,endsAt})}).where(eq(eliteSessionCovers.id,cover.id));
      await fixtureNote(tx,enrollment.id,regular.user.id,"TEST CLOCK ONLY: Jane's acknowledged covering booking #"+session.id+" moved from "+session.startsAt.toISOString()+
        " into a past synthetic hour for immediate report testing. Review key rebased to that time, with actual acknowledgement timestamp retained. No real teaching or payment. Production timing and permission checks unchanged.");
      return {enrollmentId:enrollment.id,sessionId:session.id,phase:"report-ready"};
    }
    if(bookings.length) {
      if(bookings.length!==3 || !allocation || !bookings.every((s:any,i:number)=>s.sequence===i+1))throw new Error("Incomplete fixture; review before retrying.");
      return {enrollmentId:enrollment.id,sessionId:bookings[1].id,phase:"ready"};
    }
    if(allocation)throw new Error("Unexpected existing fixture allocation.");
    let monday=addDays(localParts(new Date(),"Australia/Sydney").date,1);
    while(new Date(monday+"T00:00:00Z").getUTCDay()!==1)monday=addDays(monday,1);
    const firstEnd=new Date(Math.floor(Date.now()/60000)*60000-3*3600000);
    const schedule=[{sequence:1,lessonId:teaching[0].id,startsAt:new Date(+firstEnd-3600000),endsAt:firstEnd,status:"delivered"},
      ...[monday,addDays(monday,3)].map((date,i)=>{const start=wallTime(date,1200,"Australia/Sydney");return {sequence:i+2,lessonId:teaching[i].id,startsAt:start,endsAt:new Date(+start+3600000),status:"scheduled"};})];
    const existing=await tx.select().from(eliteTeachingSessions);
    const {zoomSessions}=await import("../../drizzle/schema.js");
    const [tables]=await tx.execute(sql`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='zoom_sessions'`);
    const legacy=tables.length?await tx.select().from(zoomSessions):[];
    if(schedule.some((s:any)=>s.sequence>1 && !covered(s.startsAt,s.endsAt,regular.profile.timezone,JSON.parse(regular.profile.windowsJson))) ||
      !covered(schedule[1].startsAt,schedule[1].endsAt,covering.profile.timezone,JSON.parse(covering.profile.windowsJson)) ||
      schedule.some((s:any)=>existing.some((b:any)=>b.status!=="cancelled" && (b.teacherId===regular.user.id || s.sequence===2 && b.teacherId===covering.user.id) && overlaps(s,b)) ||
        legacy.some((b:any)=>b.status!=="cancelled" && b.scheduledAt && (b.teacherId===regular.user.id || s.sequence===2 && b.teacherId===covering.user.id) && overlaps(s,{startsAt:b.scheduledAt,endsAt:new Date(+b.scheduledAt+(b.duration||60)*60000)}))))
      throw new Error("Test hours conflict or are outside saved availability. No existing bookings changed.");
    await tx.insert(eliteAllocations).values({enrollmentId:enrollment.id,teacherId:regular.user.id,timezone:"Australia/Sydney",weekStart:monday,
      slotsJson:JSON.stringify([{day:1,minute:1200},{day:4,minute:1200}]),parentName:"STAGING FIXTURE ONLY: no customer confirmation",parentConfirmedAt:new Date(),tutorCommitmentAt:regular.profile.commitmentAt});
    await tx.insert(eliteTeachingSessions).values(schedule.map(s=>({...s,enrollmentId:enrollment.id,teacherId:regular.user.id,studentId:student.id})));
    const saved=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id)).orderBy(asc(eliteTeachingSessions.sequence));
    if(saved.length!==3)throw new Error("Fixture insertion did not produce three bookings.");
    await tx.insert(eliteSessionReports).values({sessionId:saved[0].id,authorId:regular.user.id,requestId:randomUUID(),revisionOf:null,
      lessonUnderstanding:"STAGING SIMULATION ONLY: student understands equal parts but needs help identifying denominators.",
      nextObjectives:"STAGING SIMULATION ONLY: continue comparing equivalent fractions with shaded diagrams.",
      progressDifficulties:"STAGING SIMULATION ONLY: equal parts explained independently; denominator comparison still needs practice.",
      assignedWork:"STAGING SIMULATION ONLY: complete Easy exercises and create five questions with worked answers.",
      tutorComments:"STAGING SIMULATION ONLY: resume from the final shaded-diagram explanation and check the student's reasoning."});
    await fixtureNote(tx,enrollment.id,regular.user.id,"Three-booking synthetic handover fixture created: Session 1 has a simulated Richard report; Session 2 is future for Admin to assign Jane; Session 3 remains Richard's. Zero-value synthetic eligibility, not a real payment or accepted agreement. Student has no email or login. Nothing is owed or collected, and customer bookings are unchanged.");
    return {enrollmentId:enrollment.id,sessionId:saved[1].id,phase:"ready"};
  });
}
async function fixtureNote(tx:any,enrollmentId:number,authorId:number,content:string) {
  await tx.insert(studentFileEntries).values({enrollmentId,authorId,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,content:"STAGING COVER TEST ONLY. "+content});
}
if(process.argv[1]?.endsWith("setupEliteCoverTest.js")) {
  const args=process.argv.slice(2);
  if(args.some(a=>!["--allow-report","--archive"].includes(a)) || args.length>1){console.error("Use no argument, --allow-report, or --archive.");process.exit(1);}
  setupEliteCoverTest(args.includes("--archive")?"archive":args.includes("--allow-report")?"allow-report":"setup").then(r=>{
    console.log("STAGING cover fixture "+r.phase+". Enrolment #"+r.enrollmentId+"; Session 2 booking #"+r.sessionId+". Customer bookings unchanged. No real payment or agreement.");process.exit(0);
  }).catch((e:Error)=>{console.error("Cover fixture setup failed: "+e.message);process.exit(1);});
}
