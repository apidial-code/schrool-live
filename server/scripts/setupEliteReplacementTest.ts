import { randomUUID } from "node:crypto";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "../db.js";
import { users, enrollments, lessons, eliteTutors, eliteScheduleLock, eliteAllocations,
  eliteTeachingSessions, eliteReplacements, eliteSessionReports, studentFileEntries } from "../../drizzle/schema.js";
import { addDays, buildTeachingSchedule, covered, localParts, overlaps } from "../../shared/eliteSchedule.js";
import { sydneyDate } from "../../shared/standardSupport.js";

const marker="staging-elite-replacement-test-v1",name="STAGING REPLACEMENT TEST ONLY";
// Synthetic test flags do not represent a customer payment, accepted agreement or
// delivered teaching. The pending, email-less student cannot sign in. No mail,
// Stripe operation, invoice or tutor payment is created by this script.
export async function setupEliteReplacementTest(allowReport=false,archive=false) {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
    !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  return db.transaction(async(tx:any)=>{
    const [lock]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
    if(!lock)throw new Error("Scheduling setup required.");
    const [tutor]=await tx.select().from(users).where(eq(users.email,"pidialanil+tutor01@gmail.com")).limit(1);
    const [profile]=tutor?await tx.select().from(eliteTutors).where(eq(eliteTutors.teacherId,tutor.id)).limit(1):[];
    if(tutor?.role!=="teacher" || tutor.accountStatus!=="active" || !profile?.approved || !profile.commitmentAt)
      throw new Error("The committed approved staging test tutor is required.");
    const course=await tx.select().from(lessons).where(eq(lessons.courseId,2)).orderBy(asc(lessons.orderIndex),asc(lessons.id));
    const teaching=course.filter((l:any)=>l.title?.trim().toLowerCase()!=="access verification");
    if(teaching.length!==23 || teaching[0].title?.trim().toLowerCase()!=="what is a fraction")throw new Error("The 23-lesson course is required.");
    let [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    if(!student && (allowReport || archive))throw new Error("Create the isolated test fixture first.");
    if(!student) {
      await tx.insert(users).values({openId:marker,name,email:null,role:"student",accountStatus:"pending"});
      [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    }
    if(!student || student.openId!==marker || student.name!==name || student.email!==null || student.accountStatus!=="pending" || student.role!=="student")
      throw new Error("Fixture student identity mismatch.");
    let [enrollment]=await tx.select().from(enrollments).where(and(eq(enrollments.studentId,student.id),eq(enrollments.studentName,name))).limit(1);
    if(!enrollment && (allowReport || archive))throw new Error("Create the fixture first.");
    if(!enrollment) {
      const now=new Date();
      const [result]=await tx.insert(enrollments).values({studentId:student.id,studentName:name,courseId:2,yearLevel:"year5-6",tier:"elite",
        status:"active",paymentStatus:"paid",parentEmail:null,agreedTotalCents:0,currency:"AUD",paymentPlan:"staging_fixture",
        termsVersion:marker,acceptedAt:now,activatedAt:now,enrolledAt:now,accessEndsAt:null,
        agreementSnapshot:JSON.stringify({stagingFixture:marker,syntheticEligibilityOnly:true,
          purpose:"Isolated missed-session, parent approval and billing-record simulation. No real payment or customer agreement."})});
      [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.id,result.insertId)).limit(1);
    }
    if(!enrollment || JSON.parse(enrollment.agreementSnapshot??"null")?.stagingFixture!==marker || enrollment.studentName!==name ||
      enrollment.studentId!==student.id || enrollment.parentEmail!==null || enrollment.agreedTotalCents!==0 || enrollment.termsVersion!==marker ||
      enrollment.courseId!==2 || !["active",...(archive?["cancelled"]:[])].includes(enrollment.status) || enrollment.tier!=="elite" || enrollment.paymentStatus!=="paid" ||
      !enrollment.acceptedAt || !enrollment.activatedAt || enrollment.stripeSubscriptionId)
      throw new Error("Fixture enrolment identity mismatch.");
    const bookings=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id)).orderBy(asc(eliteTeachingSessions.sequence));
    const [allocation]=await tx.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,enrollment.id)).limit(1);
    if(bookings.some((s:any)=>s.studentId!==student.id || s.teacherId!==tutor.id) || allocation && allocation.teacherId!==tutor.id)
      throw new Error("Fixture booking ownership mismatch.");
    if(archive) {
      if(enrollment.status!=="cancelled") {
        for(const session of bookings.filter((s:any)=>s.status==="scheduled"))
          await tx.update(eliteTeachingSessions).set({status:"cancelled"}).where(eq(eliteTeachingSessions.id,session.id));
        await tx.update(enrollments).set({status:"cancelled",accessEndsAt:new Date()}).where(eq(enrollments.id,enrollment.id));
        await tx.insert(studentFileEntries).values({enrollmentId:enrollment.id,authorId:tutor.id,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,
          content:"STAGING replacement fixture archived. Unused fixture bookings cancelled to release the tutor's calendar; simulation reports and billing history retained. No actual funds collected or tutor payment owed."});
      }
      return {enrollmentId:enrollment.id,sessionId:bookings[0]?.id??0,reportReady:false,archived:true};
    }
    if(allowReport) {
      const cases=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,enrollment.id));
      const approved=cases.filter((c:any)=>c.status==="approved");
      if(approved.length!==1)throw new Error("Exactly one parent-approved fixture replacement is required.");
      const replacement=approved[0];
      const session=bookings.find((s:any)=>s.id===replacement.replacementId);
      if(!session || session.status!=="scheduled" || replacement.teacherId!==tutor.id || !replacement.approvedAt ||
        !replacement.parentName?.startsWith("STAGING TEST") || replacement.originalId!==bookings[0]?.id || replacement.feeCents!==8000)
        throw new Error("The parent-approved staging fixture does not match.");
      const reports=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.sessionId,session.id)).limit(1);
      if(reports.length)throw new Error("This fixture already has a report.");
      if(+session.endsAt<=Date.now())return {enrollmentId:enrollment.id,sessionId:session.id,reportReady:true};
      const endsAt=new Date(Math.floor(Date.now()/60000)*60000-60000),startsAt=new Date(+endsAt-3600000);
      await tx.update(eliteTeachingSessions).set({startsAt,endsAt}).where(eq(eliteTeachingSessions.id,session.id));
      await tx.insert(studentFileEntries).values({enrollmentId:enrollment.id,authorId:tutor.id,requestId:randomUUID(),kind:"note",
        entryDate:sydneyDate(new Date()),minutes:0,content:"STAGING TEST CLOCK ADVANCE ONLY. Parent-approved replacement booking #"+session.id+
          " moved from "+session.startsAt.toISOString()+" to a past fixture hour so report submission can be tested now. No actual teaching or payment. Customer schedules and production report timing rules unchanged."});
      return {enrollmentId:enrollment.id,sessionId:session.id,reportReady:true};
    }
    if(bookings.length) {
      if(!allocation || bookings.length<46 || bookings[0].sequence!==1 || +bookings[0].endsAt>=Date.now())throw new Error("Incomplete fixture; review before retrying.");
      return {enrollmentId:enrollment.id,sessionId:bookings[0].id,reportReady:false};
    }
    if(allocation)throw new Error("Unexpected existing fixture allocation.");
    let monday=addDays(localParts(new Date(),"Australia/Sydney").date,1);
    while(new Date(monday+"T00:00:00Z").getUTCDay()!==1)monday=addDays(monday,1);
    const slots=[{day:1,minute:1200},{day:4,minute:1200}];
    const schedule=buildTeachingSchedule(monday,"Australia/Sydney",slots,teaching.map((l:any)=>l.id));
    // First fixture hour is deliberately past, allowing an immediate simulated absence.
    const endsAt=new Date(Math.floor(Date.now()/60000)*60000-3600000);
    schedule[0]={...schedule[0],startsAt:new Date(+endsAt-3600000),endsAt};
    const windows=JSON.parse(profile.windowsJson);
    const existing=await tx.select().from(eliteTeachingSessions);
    const {zoomSessions}=await import("../../drizzle/schema.js");
    const [tables]=await tx.execute(sql`SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='zoom_sessions'`);
    const legacy=tables.length?await tx.select().from(zoomSessions):[];
    if(schedule.some((s:any)=>s.sequence>1 && !covered(s.startsAt,s.endsAt,profile.timezone,windows)) ||
      schedule.some((s:any)=>existing.some((b:any)=>b.teacherId===tutor.id && b.status!=="cancelled" && overlaps(s,b)) ||
        legacy.some((b:any)=>b.teacherId===tutor.id && b.status!=="cancelled" && b.scheduledAt && overlaps(s,{startsAt:b.scheduledAt,endsAt:new Date(+b.scheduledAt+(b.duration||60)*60000)}))))
      throw new Error("Fixture times conflict or do not fit the tutor's committed hours. No existing booking was changed.");
    await tx.insert(eliteAllocations).values({enrollmentId:enrollment.id,teacherId:tutor.id,timezone:"Australia/Sydney",weekStart:monday,
      slotsJson:JSON.stringify(slots),parentName:"STAGING FIXTURE ONLY: no customer confirmation",parentConfirmedAt:new Date(),tutorCommitmentAt:profile.commitmentAt});
    const [created]=await tx.insert(eliteTeachingSessions).values(schedule.map((s:any)=>({...s,enrollmentId:enrollment.id,teacherId:tutor.id,studentId:student.id,status:"scheduled"})));
    await tx.insert(studentFileEntries).values({enrollmentId:enrollment.id,authorId:tutor.id,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,
      content:"STAGING REPLACEMENT TEST ONLY. Synthetic zero-value eligibility flags, not a real payment or accepted customer agreement. Email-less pending student cannot sign in. 46 isolated test bookings, first hour deliberately past. All absence, report and billing entries are simulations and must not be paid or collected. No customer bookings changed."});
    return {enrollmentId:enrollment.id,sessionId:Number(created.insertId),reportReady:false};
  });
}
if(process.argv[1]?.endsWith("setupEliteReplacementTest.js")) {
  setupEliteReplacementTest(process.argv.includes("--allow-report"),process.argv.includes("--archive")).then(r=>{
    console.log("STAGING replacement fixture "+("archived" in r && r.archived?"archived":r.reportReady?"report-ready":"ready")+". Enrolment #"+r.enrollmentId+"; session #"+r.sessionId+". Customer bookings unchanged. No real payment or agreement.");process.exit(0);
  }).catch((e:Error)=>{console.error("Replacement fixture setup failed: "+e.message);process.exit(1);});
}
