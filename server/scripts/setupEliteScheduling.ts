import { sql } from "drizzle-orm";
import { getDb } from "../db.js";
async function setup() {
  if (process.env.APP_BASE_URL?.trim() !== "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL)
    throw new Error("Staging configuration check failed.");
  const db=await getDb();
  const definitions=[
    "elite_schedule_lock (id INT NOT NULL PRIMARY KEY)",
    "elite_tutors (teacher_id INT NOT NULL PRIMARY KEY, approved BOOLEAN NOT NULL DEFAULT FALSE, approved_by INT NOT NULL, timezone VARCHAR(100) NOT NULL DEFAULT 'Australia/Sydney', windows_json TEXT NOT NULL, commitment_at TIMESTAMP NULL, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)",
    "elite_family_invites (enrollment_id INT NOT NULL PRIMARY KEY, issued_by INT NOT NULL, token_hash VARCHAR(64) NOT NULL UNIQUE, expires_at TIMESTAMP NOT NULL)",
    "elite_allocations (enrollment_id INT NOT NULL PRIMARY KEY, teacher_id INT NOT NULL, timezone VARCHAR(100) NOT NULL, week_start VARCHAR(10) NOT NULL, slots_json TEXT NOT NULL, parent_confirmed_at TIMESTAMP NOT NULL, tutor_commitment_at TIMESTAMP NOT NULL, parent_name VARCHAR(255) NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)",
    "elite_teaching_sessions (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, enrollment_id INT NOT NULL, teacher_id INT NOT NULL, student_id INT NOT NULL, `sequence` INT NOT NULL, lesson_id INT NOT NULL, starts_at TIMESTAMP NOT NULL, ends_at TIMESTAMP NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'scheduled', UNIQUE KEY elite_session_sequence (enrollment_id,`sequence`), INDEX elite_teacher_calendar (teacher_id,starts_at))",
    "elite_session_reports (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, session_id INT NOT NULL, author_id INT NOT NULL, request_id VARCHAR(36) NOT NULL UNIQUE, revision_of INT NULL, lesson_understanding TEXT NOT NULL, next_objectives TEXT NOT NULL, progress_difficulties TEXT NOT NULL, assigned_work TEXT NOT NULL, tutor_comments TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX elite_session_report_history (session_id,id))",
  ];
  for(const definition of definitions) await db.execute(sql.raw("CREATE TABLE IF NOT EXISTS "+definition+" ENGINE=InnoDB"));
  await db.execute(sql.raw("INSERT IGNORE INTO elite_schedule_lock (id) VALUES (1)"));
  const names=["elite_schedule_lock","elite_tutors","elite_family_invites","elite_allocations","elite_teaching_sessions","elite_session_reports","student_file_entries","enrollments","users"];
  const [rows]=await db.execute(sql.raw("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ("+names.map(n=>"'"+n+"'").join(",")+")"));
  if(rows.length!==names.length || rows.some((r:any)=>r.ENGINE!=="InnoDB")) throw new Error("Transactional tables required.");
  console.log("Elite scheduling tables ready. Transactional engine: PASS.");
}
setup().then(()=>process.exit(0)).catch(()=>{console.error("Elite scheduling setup failed. Check staging configuration and table structure.");process.exit(1);});
