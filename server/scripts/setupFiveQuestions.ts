import { sql } from "drizzle-orm";
import { getDb } from "../db.js";

export async function setupFiveQuestions() {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  const [before]:any=await db.execute(sql`SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('enrollments','elite_schedule_lock','elite_allocations','elite_teaching_sessions','elite_session_reports','elite_session_covers')`);
  if(before.length!==6 || before.some((r:any)=>String(r.ENGINE).toLowerCase()!=="innodb"))throw new Error("Existing transactional scheduling tables required.");
  await db.execute(sql`CREATE TABLE IF NOT EXISTS five_question_drafts (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,enrollment_id INT NOT NULL,lesson_id INT NOT NULL,student_id INT NOT NULL,version INT NOT NULL,work_json LONGTEXT NOT NULL,UNIQUE KEY five_draft_lesson(enrollment_id,lesson_id)) ENGINE=InnoDB`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS five_question_submissions (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,enrollment_id INT NOT NULL,lesson_id INT NOT NULL,student_id INT NOT NULL,request_id VARCHAR(36) NOT NULL UNIQUE,work_json LONGTEXT NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,KEY five_submission_history(enrollment_id,lesson_id,id)) ENGINE=InnoDB`);
  await db.execute(sql`CREATE TABLE IF NOT EXISTS five_question_reviews (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,submission_id INT NOT NULL UNIQUE,enrollment_id INT NOT NULL,lesson_id INT NOT NULL,author_id INT NOT NULL,decision VARCHAR(20) NOT NULL,feedback TEXT NOT NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,KEY five_review_enrollment(enrollment_id,lesson_id)) ENGINE=InnoDB`);
  const [after]:any=await db.execute(sql`SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('five_question_drafts','five_question_submissions','five_question_reviews')`);
  if(after.length!==3 || after.some((r:any)=>String(r.ENGINE).toLowerCase()!=="innodb"))throw new Error("Transactional five-question tables required.");
  console.log("Five-question tables ready. No enrolments, bookings, accounts, payments or emails changed.");
}
if(process.argv[1]?.replace(/\\/g,"/").endsWith("/setupFiveQuestions.js"))setupFiveQuestions().then(()=>process.exit(0)).catch(e=>{console.error("Five-question setup failed: "+e.message);process.exit(1);});
