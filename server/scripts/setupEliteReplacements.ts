import { sql } from "drizzle-orm";
import { getDb } from "../db.js";
async function setup() {
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)
    throw new Error("Staging configuration required.");
  const db=await getDb();
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS elite_replacements (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, original_id INT NOT NULL UNIQUE,
    enrollment_id INT NOT NULL, teacher_id INT NOT NULL, reason VARCHAR(30) NOT NULL, note TEXT NOT NULL,
    waiting_confirmed BOOLEAN NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'awaiting_plan', plan_json TEXT NULL,
    token_hash VARCHAR(64) NULL, expires_at TIMESTAMP NULL, parent_name VARCHAR(255) NULL, approved_at TIMESTAMP NULL,
    replacement_id INT NULL, fee_cents INT NOT NULL DEFAULT 8000, funding VARCHAR(30) NOT NULL DEFAULT 'parent',
    reviewed_by INT NULL, billing_status VARCHAR(30) NOT NULL DEFAULT 'not_due', billing_reference VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX elite_replacement_enrollment (enrollment_id)
  ) ENGINE=InnoDB`));
  const [rows]=await db.execute(sql.raw("SELECT TABLE_NAME, ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('elite_replacements','elite_schedule_lock','elite_teaching_sessions','elite_session_reports','student_file_entries','enrollments')"));
  if(rows.length!==6 || rows.some((r:any)=>r.ENGINE!=="InnoDB")) throw new Error("Transactional tables required.");
  console.log("Elite replacement table ready. Transactional engine: PASS.");
}
setup().then(()=>process.exit(0)).catch(()=>{console.error("Elite replacement setup failed. Check staging configuration and tables.");process.exit(1);});
