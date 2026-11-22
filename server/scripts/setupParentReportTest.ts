import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../db.js";
import { parentRouter } from "../routers/parent.js";
import { users, enrollments, lessons, eliteScheduleLock, eliteTeachingSessions, eliteSessionReports, parentStudentLinks, studentFileEntries } from "../../drizzle/schema.js";
import { sydneyDate } from "../../shared/standardSupport.js";
const marker="staging-parent-report-test-v1",name="STAGING PARENT REPORT TEST ONLY";
const emails=["pidialanil+familytest01@gmail.com","pidialanil+familytest02@gmail.com"];
type Mode="setup"|"verify"|"archive";
export async function setupParentReportTest(mode:Mode="setup") {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)throw new Error("Staging configuration required.");
  const db=await getDb();
  const fixture=await db.transaction(async(tx:any)=>{
    const [lock]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
    if(!lock)throw new Error("Scheduling setup required.");
    const accounts=[];
    for(const [index,role] of ["student","parent","parent"].entries()) {
      const openId=marker+"-"+index,email=index?emails[index-1]:null,accountName=index?"STAGING FAMILY TEST "+index:name;
      let [account]=await tx.select().from(users).where(eq(users.openId,openId)).limit(1);
      if(!account && mode!=="setup")throw new Error("Create the isolated fixture first.");
      if(!account){const [created]=await tx.insert(users).values({openId,name:accountName,email,role,accountStatus:"active"});
        [account]=await tx.select().from(users).where(eq(users.id,created.insertId)).limit(1);}
      if(!account || account.openId!==openId || account.name!==accountName || account.email!==email || account.role!==role ||
        !["active",...(mode==="archive"?["pending"]:[])].includes(account.accountStatus))throw new Error("Fixture account identity mismatch; no existing account may be repurposed.");
      accounts.push(account);
    }
    const [student,primary,outsider]=accounts;
    let [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.studentId,student.id)).limit(1);
    if(!enrollment && mode!=="setup")throw new Error("Create the fixture enrolment first.");
    if(!enrollment){const [created]=await tx.insert(enrollments).values({studentId:student.id,studentName:name,courseId:2,yearLevel:"year5-6",tier:"elite",status:"active",paymentStatus:"unpaid",
      agreedTotalCents:0,parentEmail:emails[0],parentId:null,acceptedAt:null,activatedAt:null,accessEndsAt:null,
      agreementSnapshot:JSON.stringify({stagingFixture:marker,purpose:"Parent report visibility and unrelated-parent denial. No actual teaching, payment or agreement."})});
      [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.id,created.insertId)).limit(1);}
    if(!enrollment || enrollment.studentId!==student.id || enrollment.studentName!==name || enrollment.courseId!==2 || enrollment.yearLevel!=="year5-6" || enrollment.tier!=="elite" ||
      enrollment.parentEmail!==emails[0] || enrollment.parentId && enrollment.parentId!==primary.id || enrollment.agreedTotalCents!==0 || enrollment.paymentStatus!=="unpaid" || enrollment.acceptedAt || enrollment.activatedAt || enrollment.stripeSubscriptionId ||
      JSON.parse(enrollment.agreementSnapshot??"null")?.stagingFixture!==marker || !["active",...(mode==="archive"?["cancelled"]:[])].includes(enrollment.status))throw new Error("Fixture enrolment identity mismatch.");
    const parentIds=[primary.id,outsider.id];
    const linkedEnrollments=await tx.select().from(enrollments).where(inArray(enrollments.parentId,parentIds));
    const links=await tx.select().from(parentStudentLinks).where(inArray(parentStudentLinks.parentId,parentIds));
    if(linkedEnrollments.some((e:any)=>e.id!==enrollment.id || e.parentId!==primary.id) || links.some((l:any)=>l.studentId!==student.id || l.parentId!==primary.id))throw new Error("Test parent accounts have unexpected family links.");
    if(mode==="archive") {
      if(enrollment.status!=="cancelled") {
        await tx.update(enrollments).set({status:"cancelled",parentId:null,accessEndsAt:new Date()}).where(eq(enrollments.id,enrollment.id));
        for(const link of links)await tx.update(parentStudentLinks).set({status:"revoked"}).where(eq(parentStudentLinks.id,link.id));
        for(const account of accounts)await tx.update(users).set({accountStatus:"pending"}).where(eq(users.id,account.id));
        await note(tx,enrollment.id,primary.id,"Archived isolated fixture; family access removed and fixture accounts disabled. Report history retained. No customer account or booking changed.");
      }
      return {enrollmentId:enrollment.id,primary,outsider,phase:"archived"};
    }
    if(mode==="verify")return {enrollmentId:enrollment.id,primary,outsider,phase:"verify"};
    const [tutor]=await tx.select().from(users).where(eq(users.email,"pidialanil+tutor01@gmail.com")).limit(1);
    if(tutor?.role!=="teacher" || tutor.accountStatus!=="active")throw new Error("Active staging tutor Richard required.");
    const [lesson]=await tx.select().from(lessons).where(eq(lessons.courseId,2)).orderBy(asc(lessons.orderIndex),asc(lessons.id)).limit(1);
    if(lesson?.title?.trim().toLowerCase()!=="what is a fraction")throw new Error("Expected first teaching lesson unavailable.");
    let sessions=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id));
    if(!sessions.length){const endsAt=new Date(Math.floor(Date.now()/60000)*60000-3600000);
      await tx.insert(eliteTeachingSessions).values({enrollmentId:enrollment.id,teacherId:tutor.id,studentId:student.id,sequence:1,lessonId:lesson.id,startsAt:new Date(+endsAt-3600000),endsAt,status:"delivered"});
      sessions=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id));}
    if(sessions.length!==1 || sessions[0].studentId!==student.id || sessions[0].teacherId!==tutor.id || sessions[0].sequence!==1 || sessions[0].lessonId!==lesson.id || sessions[0].status!=="delivered" || +sessions[0].endsAt>=Date.now())throw new Error("Fixture teaching record mismatch.");
    const session=sessions[0];
    const reports=await tx.select().from(eliteSessionReports).where(eq(eliteSessionReports.sessionId,session.id)).orderBy(asc(eliteSessionReports.id));
    if(reports.length && (reports.length!==2 || reports.some((r:any)=>r.authorId!==tutor.id || !r.lessonUnderstanding.startsWith("STAGING SIMULATION ONLY:")) || reports[0].revisionOf!==null || reports[1].revisionOf!==reports[0].id))throw new Error("Fixture report history mismatch.");
    if(!reports.length){const fields={sessionId:session.id,authorId:tutor.id,lessonUnderstanding:"STAGING SIMULATION ONLY: reviewed equal parts and denominators.",nextObjectives:"STAGING SIMULATION ONLY: compare equivalent fractions using shaded diagrams.",progressDifficulties:"STAGING SIMULATION ONLY: equal parts understood; denominators need practice.",assignedWork:"STAGING SIMULATION ONLY: create five questions with worked answers.",tutorComments:"STAGING SIMULATION ONLY: original report; revisit the visual explanation."};
      const [original]=await tx.insert(eliteSessionReports).values({...fields,requestId:randomUUID(),revisionOf:null});
      await tx.insert(eliteSessionReports).values({...fields,requestId:randomUUID(),revisionOf:Number(original.insertId),tutorComments:"STAGING SIMULATION ONLY: CORRECTION: student explained equal parts independently; denominator comparison needs further practice."});
      await note(tx,enrollment.id,tutor.id,"Isolated parent report fixture created with an original report and correction. Only a synthetic past hour is recorded. No real teaching, accepted agreement, payment, invoice or email. Admin must manually verify and link the primary test parent; the unrelated parent must remain unlinked.");}
    return {enrollmentId:enrollment.id,primary,outsider,phase:"ready"};
  });
  if(mode==="verify")await verifyParents(fixture);
  return {enrollmentId:fixture.enrollmentId,primaryEmail:emails[0],unrelatedEmail:emails[1],phase:mode==="verify"?"verified":fixture.phase};
}
async function verifyParents(fixture:any) {
  const caller=(user:any)=>parentRouter.createCaller({user,sessionTokenHash:null,req:{headers:{}} as any,res:{setHeader(){}} as any});
  const primary=caller(fixture.primary),outsider=caller(fixture.outsider);
  const visible=await primary.enrollments();
  if(visible.length!==1 || visible[0].id!==fixture.enrollmentId)throw new Error("Admin must link the primary fixture parent to this test enrolment first.");
  const reports=await primary.reports({enrollmentId:fixture.enrollmentId,page:0});
  if(reports.rows.length!==2 || reports.rows[0].revisionOf!==reports.rows[1].id || !reports.rows[0].tutorComments.includes("CORRECTION:"))throw new Error("Original and correction not visible in the expected order.");
  await primary.overview({enrollmentId:fixture.enrollmentId});await primary.schedule({enrollmentId:fixture.enrollmentId});
  if((await outsider.enrollments()).length)throw new Error("Unrelated fixture parent unexpectedly has an enrolment.");
  for(const who of [outsider,primary])for(const enrollmentId of who===outsider?[fixture.enrollmentId,16]:[16]) {
    for(const method of ["overview","schedule","reports"] as const){let denied=false;
      try{await who[method]({enrollmentId,page:0});}catch(e){if((e as any).code==="NOT_FOUND")denied=true;else throw e;}
      if(!denied)throw new Error("Cross-family access was not denied.");}
  }
  console.log("PASS: original and correction visible; unrelated parent list empty; direct overview, schedule and report requests denied across families. Backend checks only; browser sign-in is tested separately.");
}
async function note(tx:any,enrollmentId:number,authorId:number,content:string){await tx.insert(studentFileEntries).values({enrollmentId,authorId,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,content:"STAGING PARENT REPORT TEST ONLY. "+content});}
if(process.argv[1]?.endsWith("setupParentReportTest.js")) {
  const args=process.argv.slice(2);if(args.length>1 || args.some(a=>!["--verify","--archive"].includes(a))){console.error("Use no argument, --verify, or --archive.");process.exit(1);}
  setupParentReportTest(args.includes("--archive")?"archive":args.includes("--verify")?"verify":"setup").then(r=>{console.log("STAGING parent report fixture "+r.phase+". Enrolment #"+r.enrollmentId+". Primary: "+r.primaryEmail+". Unrelated: "+r.unrelatedEmail+". No customer bookings changed; no emails or payments sent.");process.exit(0);}).catch(e=>{console.error("Parent report fixture failed: "+e.message);process.exit(1);});
}
