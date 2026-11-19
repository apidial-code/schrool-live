import { sql } from "drizzle-orm";
import { getDb } from "../db.js";
async function setup() {
  if (process.env.APP_BASE_URL?.trim() !== "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL) {
    throw new Error("Staging configuration check failed.");
  }
  const db = await getDb();
  await db.execute(sql.raw(`CREATE TABLE IF NOT EXISTS student_file_entries (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL, author_id INT NOT NULL,
    request_id VARCHAR(36) NOT NULL UNIQUE,
    kind VARCHAR(20) NOT NULL, entry_date VARCHAR(10) NOT NULL,
    minutes INT NOT NULL DEFAULT 0, content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX student_file_entry_history (enrollment_id, id)
  ) ENGINE=InnoDB`));
  const [rows] = await db.execute(sql.raw(`SELECT ENGINE FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('student_file_entries', 'enrollments')`));
  if (rows.length !== 2 || rows.some((r: any) => r.ENGINE !== "InnoDB")) throw new Error("Transactional tables required.");
  console.log("Student file entries table ready. Transactional engine: PASS.");
}
setup().then(() => process.exit(0)).catch(() => { console.error("Student file table setup failed. Check staging database configuration and structure."); process.exit(1); });
