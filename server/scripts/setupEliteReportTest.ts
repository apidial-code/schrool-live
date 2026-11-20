import { randomUUID } from "node:crypto";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { users, enrollments, lessons, eliteTutors, eliteScheduleLock, eliteAllocations, eliteTeachingSessions, studentFileEntries } from "../../drizzle/schema.js";
import { sydneyDate } from "../../shared/standardSupport.js";

// Isolated report-only fixture: no email, accepted agreement, payment or invoice.
// It creates one past session, never edits a customer's existing bookings.
export async function setupEliteReportTest() {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  return db.transaction(async(tx:any)=>{
    const [lock]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
    if(!lock) throw new Error("Scheduling setup required.");
    const [tutor]=await tx.select().from(users).where(eq(users.email,"pidialanil+tutor01@gmail.com")).limit(1);
    const [profile]=tutor?await tx.select().from(eliteTutors).where(eq(eliteTutors.teacherId,tutor.id)).limit(1):[];
    if(tutor?.role!=="teacher" || tutor.accountStatus!=="active" || !profile?.approved)
      throw new Error("The approved staging test tutor is required.");
    const [lesson]=await tx.select().from(lessons).where(eq(lessons.courseId,2)).orderBy(asc(lessons.orderIndex),asc(lessons.id)).limit(1);
    if(!lesson || lesson.title?.trim().toLowerCase()!=="what is a fraction") throw new Error("Expected first teaching lesson unavailable.");
    const marker="staging-elite-report-test-v1",name="STAGING REPORT TEST ONLY";
    let [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    if(!student) {
      await tx.insert(users).values({openId:marker,name,email:null,role:"student",accountStatus:"pending"});
      [student]=await tx.select().from(users).where(eq(users.openId,marker)).limit(1);
    }
    if(!student || student.role!=="student" || student.accountStatus!=="pending" || student.email!==null) throw new Error("Fixture account does not match.");
    let [enrollment]=await tx.select().from(enrollments).where(and(eq(enrollments.studentId,student.id),eq(enrollments.studentName,name))).limit(1);
    if(!enrollment) {
      const [created]=await tx.insert(enrollments).values({studentId:student.id,studentName:name,courseId:2,
        yearLevel:"year5-6",tier:"elite",status:"active",paymentStatus:"unpaid",parentEmail:null,
        acceptedAt:null,activatedAt:null,accessEndsAt:null,enrolledAt:null,
        agreementSnapshot:JSON.stringify({stagingFixture:marker,purpose:"Isolated session report save and correction test. No customer payment or agreement."})});
      [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.id,created.insertId)).limit(1);
    }
    if(!enrollment || JSON.parse(enrollment.agreementSnapshot??"null")?.stagingFixture!==marker || enrollment.paymentStatus!=="unpaid" ||
        enrollment.acceptedAt || enrollment.activatedAt) throw new Error("Fixture enrolment does not match.");
    const [allocation]=await tx.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,enrollment.id)).limit(1);
    if(allocation && allocation.teacherId!==tutor.id) throw new Error("Fixture belongs to a different tutor.");
    const endsAt=new Date(Math.floor(Date.now()/60000)*60000-3600000);
    const startsAt=new Date(endsAt.getTime()-3600000);
    const monday=new Date(startsAt);
    monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);
    if(!allocation) await tx.insert(eliteAllocations).values({enrollmentId:enrollment.id,teacherId:tutor.id,
      timezone:"Australia/Sydney",weekStart:monday.toISOString().slice(0,10),slotsJson:"[]",
      parentName:"STAGING FIXTURE ONLY: no family confirmation",parentConfirmedAt:new Date(),tutorCommitmentAt:profile.commitmentAt??new Date()});
    let [session]=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id)).limit(1);
    if(!session) {
      const [created]=await tx.insert(eliteTeachingSessions).values({enrollmentId:enrollment.id,teacherId:tutor.id,
        studentId:student.id,sequence:1,lessonId:lesson.id,startsAt,endsAt,status:"scheduled"});
      [session]=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.id,created.insertId)).limit(1);
      await tx.insert(studentFileEntries).values({enrollmentId:enrollment.id,authorId:tutor.id,requestId:randomUUID(),
        kind:"note",entryDate:sydneyDate(new Date()),minutes:0,
        content:"STAGING REPORT TEST ONLY. One past report-only fixture session; no teaching delivered yet, no parent agreement, payment or invoice. Any reports are simulation data. Customer schedules are unchanged."});
    }
    if(session.teacherId!==tutor.id || session.endsAt.getTime()>=Date.now()) throw new Error("Fixture session does not match.");
    return {enrollmentId:Number(enrollment.id),sessionId:Number(session.id)};
  });
}
if(process.argv[1]?.endsWith("setupEliteReportTest.js")) {
  setupEliteReportTest().then(result=>{console.log("STAGING report fixture ready. Enrolment #"+result.enrollmentId+"; session #"+result.sessionId+". Customer bookings unchanged.");process.exit(0);})
    .catch(()=>{console.error("Report fixture setup failed. Verify staging configuration and the approved test tutor.");process.exit(1);});
}
