import { sql } from "drizzle-orm";
import { getDb } from "../db.js";

async function setup() {
  const stagingOrigin =
    "https://schrool-platform-staging-3583c1139100.herokuapp.com";

  if (
    process.env.APP_BASE_URL?.trim() !== stagingOrigin ||
    !process.env.DATABASE_URL ||
    !process.env.JAWSDB_URL ||
    process.env.DATABASE_URL !== process.env.JAWSDB_URL
  ) {
    throw new Error("Staging configuration check failed.");
  }

  const db = await getDb();

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS login_links (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      remember_device BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      used_at TIMESTAMP NULL DEFAULT NULL,
      INDEX login_links_user_created (user_id, created_at)
    ) ENGINE=InnoDB
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS login_sessions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      token_hash VARCHAR(64) NOT NULL UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      revoked_at TIMESTAMP NULL DEFAULT NULL,
      INDEX login_sessions_user (user_id)
    ) ENGINE=InnoDB
  `));

  const [tables] = await db.execute(sql.raw(`
    SELECT TABLE_NAME, ENGINE
    FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME IN ('login_links', 'login_sessions', 'users')
  `));

  if (
    tables.length !== 3 ||
    tables.some((table: any) => table.ENGINE !== "InnoDB")
  ) {
    throw new Error("Required transactional tables are unavailable.");
  }

  console.log(
    "Staging sign-in tables ready: login_links, login_sessions"
  );
  console.log("Transactional database engine: PASS");
}

setup().then(() => {
  process.exit(0);
}).catch(() => {
  console.error(
    "Sign-in table setup failed. Check staging configuration and database structure."
  );
  process.exit(1);
});
