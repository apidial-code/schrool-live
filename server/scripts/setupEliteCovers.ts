import { sql } from "drizzle-orm";
import { getDb } from "../db.js";
async function setup() {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS elite_session_covers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, session_id INT NOT NULL, enrollment_id INT NOT NULL,
    regular_teacher_id INT NOT NULL, cover_teacher_id INT NOT NULL, approved_by INT NOT NULL,
    reason TEXT NOT NULL, handover TEXT NOT NULL, family_notice TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'assigned',
    review_key VARCHAR(64) NULL, acknowledged_at TIMESTAMP NULL, return_note TEXT NULL,
    returned_report_id INT NULL, returned_at TIMESTAMP NULL, cancelled_by INT NULL, cancellation_reason TEXT NULL,
    late_review_approved_by INT NULL, late_review_reason TEXT NULL, late_review_approved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX elite_cover_session (session_id,id), INDEX elite_cover_regular_tutor (regular_teacher_id,id)
  ) ENGINE=InnoDB`));
  const [rows]=await db.execute(sql.raw("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('elite_session_covers','elite_schedule_lock','elite_teaching_sessions','elite_session_reports','elite_replacements','student_file_entries','enrollments')"));
  if(rows.length!==7 || rows.some((r:any)=>r.ENGINE!=="InnoDB"))throw new Error("Transactional tables required.");
  console.log("Elite covering tutor table ready. Transactional engine: PASS.");
}
setup().then(()=>process.exit(0)).catch(()=>{console.error("Elite cover setup failed. Check staging configuration and tables.");process.exit(1);});
