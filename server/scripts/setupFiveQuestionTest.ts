import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../db.js";
import { fiveQuestionsRouter } from "../routers/fiveQuestions.js";
import { lessonsRouter } from "../routers/lessons.js";
import { sydneyDate } from "../../shared/standardSupport.js";
import { users, enrollments, lessons, lessonQuestions, lessonAttempts, eliteTutors, eliteAllocations, eliteScheduleLock,
  eliteTeachingSessions, eliteSessionReports, parentStudentLinks, studentFileEntries,
  fiveQuestionSubmissions } from "../../drizzle/schema.js";

const marker="staging-five-question-test-v1",name="STAGING FIVE QUESTION TEST ONLY";
const emails=["pidialanil+fiveq01@gmail.com","pidialanil+fiveqparent01@gmail.com","pidialanil+fiveqother01@gmail.com"];
type Mode="setup"|"allow-approval"|"verify"|"archive";

export async function setupFiveQuestionTest(mode:Mode="setup") {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  const fixture=await db.transaction(async(tx:any)=>{
    const [lock]=await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
    if(!lock)throw new Error("Scheduling setup required.");
    const accounts=[];
    for(const [index,role] of ["student","parent","parent"].entries()) {
      const openId=marker+"-"+index,accountName=index===0?name:index===1?"STAGING FIVE QUESTION PARENT":"STAGING FIVE QUESTION UNRELATED";
      let [account]=await tx.select().from(users).where(eq(users.openId,openId)).limit(1);
      if(!account&&mode!=="setup")throw new Error("Create the isolated fixture first.");
      if(!account) {
        const collision=await tx.select({id:users.id}).from(users).where(eq(users.email,emails[index]));
        if(collision.length)throw new Error("A fixture email already belongs to another account; no account was repurposed.");
        const [created]=await tx.insert(users).values({openId,name:accountName,email:emails[index],role,accountStatus:"active"});
        [account]=await tx.select().from(users).where(eq(users.id,created.insertId));
      }
      if(!account || account.openId!==openId || account.name!==accountName || account.email!==emails[index] || account.role!==role ||
        !["active",...(mode==="archive"?["pending"]:[])].includes(account.accountStatus))throw new Error("Fixture account identity mismatch.");
      accounts.push(account);
    }
    const [student,parent,outsider]=accounts;
    const owned=await tx.select().from(enrollments).where(eq(enrollments.studentId,student.id));
    if(owned.length>1)throw new Error("Fixture student has unexpected enrolments.");
    let enrollment=owned[0];
    if(!enrollment&&mode!=="setup")throw new Error("Create the isolated enrolment first.");
    if(!enrollment) {
      const now=new Date();
      const [created]=await tx.insert(enrollments).values({studentId:student.id,studentName:name,courseId:2,yearLevel:"year5-6",tier:"elite",status:"active",paymentStatus:"paid",
        agreedTotalCents:0,currency:"AUD",paymentPlan:"staging_fixture",termsVersion:marker,parentEmail:emails[1],parentId:null,acceptedAt:now,activatedAt:now,enrolledAt:now,accessEndsAt:null,
        agreementSnapshot:JSON.stringify({stagingFixture:marker,syntheticEligibilityOnly:true,purpose:"Five-question browser test. Synthetic paid and accepted flags only; no real payment, accepted agreement, teaching or tutor earnings."})});
      [enrollment]=await tx.select().from(enrollments).where(eq(enrollments.id,created.insertId));
    }
    if(!enrollment || enrollment.studentId!==student.id || enrollment.studentName!==name || enrollment.courseId!==2 || enrollment.yearLevel!=="year5-6" || enrollment.tier!=="elite" ||
      enrollment.parentEmail!==emails[1] || enrollment.parentId&&enrollment.parentId!==parent.id || enrollment.agreedTotalCents!==0 || enrollment.termsVersion!==marker || enrollment.paymentPlan!=="staging_fixture" ||
      enrollment.paymentStatus!=="paid" || !enrollment.acceptedAt || !enrollment.activatedAt || enrollment.stripeSubscriptionId ||
      JSON.parse(enrollment.agreementSnapshot??"null")?.stagingFixture!==marker || !["active",...(mode==="archive"?["cancelled"]:[])].includes(enrollment.status))throw new Error("Fixture enrolment identity mismatch.");
    const linked=await tx.select().from(enrollments).where(inArray(enrollments.parentId,[parent.id,outsider.id]));
    const links=await tx.select().from(parentStudentLinks).where(inArray(parentStudentLinks.parentId,[parent.id,outsider.id]));
    const studentLinks=await tx.select().from(parentStudentLinks).where(eq(parentStudentLinks.studentId,student.id));
    if(linked.some((e:any)=>e.id!==enrollment.id||e.parentId!==parent.id) || [...links,...studentLinks].some((l:any)=>l.studentId!==student.id||l.parentId!==parent.id))throw new Error("Unexpected family links on the isolated accounts.");
    let [allocation]=await tx.select().from(eliteAllocations).where(eq(eliteAllocations.enrollmentId,enrollment.id));
    const [tutor]=await tx.select().from(users).where(eq(users.email,"pidialanil+tutor01@gmail.com"));
    if(!tutor || tutor.role!=="teacher" || allocation&&allocation.teacherId!==tutor.id)throw new Error("Expected staging regular tutor Richard.");
    if(mode!=="archive") {
      const [profile]=await tx.select().from(eliteTutors).where(eq(eliteTutors.teacherId,tutor.id));
      if(tutor.accountStatus!=="active" || !profile?.approved || !profile.commitmentAt)throw new Error("Richard must be active, approved and committed.");
    }
    if(!allocation&&mode!=="setup")throw new Error("Fixture allocation missing.");
    if(!allocation) {
      const now=new Date();
      await tx.insert(eliteAllocations).values({enrollmentId:enrollment.id,teacherId:tutor.id,timezone:"Australia/Sydney",weekStart:sydneyDate(now),slotsJson:"[]",
        parentConfirmedAt:now,tutorCommitmentAt:now,parentName:"STAGING SIMULATION ONLY"});
    } else if(allocation.parentName!=="STAGING SIMULATION ONLY" || allocation.slotsJson!=="[]")throw new Error("Unexpected allocation details.");
    const course=(await tx.select().from(lessons).where(eq(lessons.courseId,2)).orderBy(asc(lessons.orderIndex),asc(lessons.id)))
      .filter((l:any)=>l.title?.trim().toLowerCase()!=="access verification");
    if(course.length!==23 || course[0].title?.trim().toLowerCase()!=="what is a fraction")throw new Error("Expected 23-lesson Year 5/6 course unavailable.");
    const bookings=await tx.select().from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,enrollment.id));
    if(bookings.length>2 || bookings.some((b:any)=>b.studentId!==student.id||b.teacherId!==tutor.id||b.lessonId!==course[0].id||![1,2].includes(b.sequence)||b.status!=="delivered"||+b.endsAt>=Date.now()||+b.endsAt-+b.startsAt!==3600000))throw new Error("Unexpected synthetic teaching records.");
    if(mode==="archive") {
      if(enrollment.status!=="cancelled") {
        await tx.update(enrollments).set({status:"cancelled",parentId:null,accessEndsAt:new Date()}).where(eq(enrollments.id,enrollment.id));
        for(const link of links)await tx.update(parentStudentLinks).set({status:"revoked"}).where(eq(parentStudentLinks.id,link.id));
        for(const account of accounts)await tx.update(users).set({accountStatus:"pending"}).where(eq(users.id,account.id));
        await note(tx,enrollment.id,tutor.id,"Fixture archived. Test accounts disabled and family access removed. Work, review, exercise and synthetic teaching history retained. No customer bookings or financial records changed.");
      }
    } else if(mode==="allow-approval") {
      const [submission]=await tx.select().from(fiveQuestionSubmissions).where(and(eq(fiveQuestionSubmissions.enrollmentId,enrollment.id),eq(fiveQuestionSubmissions.lessonId,course[0].id))).orderBy(desc(fiveQuestionSubmissions.id)).limit(1);
      if(!submission || submission.studentId!==student.id)throw new Error("Submit the five-question work through the student screen first.");
      if(bookings.length!==0&&bookings.length!==2)throw new Error("Incomplete synthetic teaching fixture.");
      if(!bookings.length) {
        const now=new Date(Math.floor(Date.now()/60000)*60000-3600000);
        for(let i=0;i<2;i++) {
          const endsAt=new Date(+now-(1-i)*3600000);
          const [created]=await tx.insert(eliteTeachingSessions).values({enrollmentId:enrollment.id,studentId:student.id,teacherId:tutor.id,sequence:i+1,lessonId:course[0].id,startsAt:new Date(+endsAt-3600000),endsAt,status:"delivered"});
          await tx.insert(eliteSessionReports).values({sessionId:Number(created.insertId),authorId:tutor.id,requestId:randomUUID(),revisionOf:null,
            lessonUnderstanding:"STAGING SIMULATION ONLY: synthetic first-lesson teaching hour.",nextObjectives:"STAGING SIMULATION ONLY: review the student's five questions.",
            progressDifficulties:"STAGING SIMULATION ONLY: test the approval prerequisites.",assignedWork:"STAGING SIMULATION ONLY: five questions with worked answers.",tutorComments:"STAGING SIMULATION ONLY: no actual teaching or tutor earnings."});
        }
      }
      for(const difficulty of ["easy","medium","challenging"]) {
        const attempts=await tx.select().from(lessonAttempts).where(and(eq(lessonAttempts.enrollmentId,enrollment.id),eq(lessonAttempts.studentId,student.id),eq(lessonAttempts.lessonId,course[0].id),eq(lessonAttempts.difficulty,difficulty)));
        if(attempts.some((a:any)=>a.status==="submitted"&&a.validScore>=8))continue;
        const questions=await tx.select().from(lessonQuestions).where(and(eq(lessonQuestions.lessonId,course[0].id),eq(lessonQuestions.difficulty,difficulty))).orderBy(asc(lessonQuestions.orderIndex),asc(lessonQuestions.id));
        if(questions.length!==10 || new Set(questions.map((q:any)=>q.sourceId)).size!==10)throw new Error("Expected ten questions per difficulty.");
        const answers:Record<string,number>={};
        const snapshot=questions.map((q:any)=>{const options=JSON.parse(q.optionsJson);if(!Array.isArray(options)||!options.includes(q.correctAnswer))throw new Error("Invalid exercise content.");
          answers[q.sourceId]=options.indexOf(q.correctAnswer);return {sourceId:q.sourceId,questionText:"STAGING SIMULATION ONLY: "+q.questionText,diagram:q.diagram,options,correctAnswer:q.correctAnswer,solutionVideoId:q.solutionVideoId,bunnyLibraryId:course[0].bunnyLibraryId??null};});
        await tx.insert(lessonAttempts).values({studentId:student.id,enrollmentId:enrollment.id,lessonId:course[0].id,difficulty,attemptToken:randomUUID(),activeKey:null,status:"submitted",rawScore:10,validScore:10,submittedAt:new Date(),questionSnapshot:JSON.stringify(snapshot),answersJson:JSON.stringify(answers),solutionViewedJson:"[]"});
      }
      if(!bookings.length)await note(tx,enrollment.id,tutor.id,"TEST PREREQUISITES ONLY: added two past synthetic teaching hours with labelled reports and synthetic first-lesson exercise passes. No actual student scores, teaching, payment, agreement or tutor earnings. Five-question work and tutor decisions must still be submitted through the real screens.");
    } else if(mode==="setup"&&!owned.length) {
      await note(tx,enrollment.id,tutor.id,"Isolated browser test created. Zero-value synthetic paid/accepted/activated eligibility only; no real customer payment, agreement or teaching. No future bookings. Admin may link only the controlled fixture parent. Exercise passes and teaching prerequisites remain absent until --allow-approval.");
    }
    return {enrollmentId:enrollment.id,student,parent,outsider,tutor,lessonId:course[0].id,nextLessonId:course[1].id};
  });
  if(mode==="verify")await verify(fixture);
  return {enrollmentId:fixture.enrollmentId,studentEmail:emails[0],parentEmail:emails[1],phase:mode==="archive"?"archived":mode==="verify"?"verified":mode==="allow-approval"?"approval-ready":"ready"};
}
async function verify(f:any) {
  const context=(user:any)=>({user,sessionTokenHash:null,req:{headers:{}} as any,res:{setHeader(){}} as any});
  const student=fiveQuestionsRouter.createCaller(context(f.student)),parent=fiveQuestionsRouter.createCaller(context(f.parent)),outsider=fiveQuestionsRouter.createCaller(context(f.outsider));
  const input={enrollmentId:f.enrollmentId,lessonId:f.lessonId},history=await student.history(input);
  if(history.rows.length<2 || history.rows[0].decision!=="approved" || !history.rows.some((r:any)=>r.decision==="revise"&&!!r.feedback))throw new Error("Complete a revision request, resubmission and final tutor approval through the screens first.");
  const work=await student.submission({...input,submissionId:history.rows[0].id});
  if(!work.some(q=>q.photo) || !work.some(q=>q.question.trim()&&q.answer.trim()))throw new Error("Test both a photo and typed question with worked answer.");
  await student.submission({...input,submissionId:history.rows[history.rows.length-1].id});
  await parent.history(input);await parent.submission({...input,submissionId:history.rows[0].id});
  const list=await lessonsRouter.createCaller(context(f.student)).list({enrollmentId:f.enrollmentId});
  if(!list.find(l=>l.id===f.nextLessonId)?.unlocked)throw new Error("Next lesson not unlocked after approval.");
  for(const who of [outsider,student,parent])for(const enrollmentId of who===outsider?[f.enrollmentId,16]:[16]) {
    for(const method of ["course","history","submission"] as const) {
      let denied=false;try{
        if(method==="course")await who.course({enrollmentId});else if(method==="history")await who.history({...input,enrollmentId});else await who.submission({...input,enrollmentId,submissionId:history.rows[0].id});
      }catch(e){if(["NOT_FOUND","FORBIDDEN"].includes((e as any).code))denied=true;else throw e;}
      if(!denied)throw new Error("Cross-family work access was not denied.");
    }
  }
  console.log("PASS: typed work and photo retained; revision and approval history preserved; linked parent can read; next lesson unlocked; unrelated and cross-family work requests denied. Backend checks only; browser sign-in and photo readability are tested separately.");
}
async function note(tx:any,enrollmentId:number,authorId:number,content:string) {
  await tx.insert(studentFileEntries).values({enrollmentId,authorId,requestId:randomUUID(),kind:"note",entryDate:sydneyDate(new Date()),minutes:0,content:name+". "+content});
}
if(process.argv[1]?.replace(/\\/g,"/").endsWith("/setupFiveQuestionTest.js")) {
  const args=process.argv.slice(2);if(args.length>1||args.some(a=>!["--allow-approval","--verify","--archive"].includes(a))){console.error("Use no argument, --allow-approval, --verify, or --archive.");process.exit(1);}
  const mode:Mode=args.includes("--archive")?"archive":args.includes("--verify")?"verify":args.includes("--allow-approval")?"allow-approval":"setup";
  setupFiveQuestionTest(mode).then(r=>{console.log("STAGING five-question fixture "+r.phase+". Enrolment #"+r.enrollmentId+". Student: "+r.studentEmail+". Parent: "+r.parentEmail+". No customer bookings changed; no emails, charges or tutor payments sent.");process.exit(0);}).catch(e=>{console.error("Five-question fixture failed: "+e.message);process.exit(1);});
}
