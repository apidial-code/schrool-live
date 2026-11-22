import { sql } from "drizzle-orm";
import { getDb } from "../db.js";
async function main(){
  if(process.env.APP_BASE_URL?.trim()!=="https://schrool-platform-staging-3583c1139100.herokuapp.com" || !process.env.DATABASE_URL || process.env.DATABASE_URL!==process.env.JAWSDB_URL)throw new Error("Staging configuration required.");
  const db=await getDb();
  await db.execute(sql`CREATE TABLE IF NOT EXISTS parent_student_links (id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,parent_id INT NOT NULL,student_id INT NOT NULL,status VARCHAR(30) NOT NULL DEFAULT 'pending',verified_at TIMESTAMP NULL,created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,UNIQUE KEY parent_student_pair(parent_id,student_id)) ENGINE=InnoDB`);
  const [rows]:any=await db.execute(sql`SELECT ENGINE FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('users','enrollments','parent_student_links','student_file_entries')`);
  if(rows.length!==4 || rows.some((r:any)=>String(r.ENGINE).toLowerCase()!=="innodb"))throw new Error("Transactional InnoDB tables required.");
  console.log("Parent relationship table ready. Transactional engine: PASS. No family links or customer accounts changed.");
}
main().then(()=>process.exit(0)).catch(e=>{console.error("Parent link setup failed: "+e.message);process.exit(1);});
