import "dotenv/config";
import { sql } from "drizzle-orm";
import { getDb } from "../dist-server/server/db.js";
import {
  getSignInOrigin,
} from "../dist-server/server/_core/signInEmail.js";

const stagingOrigin =
  "https://schrool-platform-staging-3583c1139100.herokuapp.com";

try {
  if (
    getSignInOrigin() !== stagingOrigin ||
    process.env.CONFIRM_PAYMENT_TABLE !== "schrool-platform-staging"
  ) {
    throw new Error("Staging database setup confirmation required.");
  }

  const db = await getDb();

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS enrollment_payments (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL,
      attempt_key VARCHAR(36) NOT NULL UNIQUE,
      active_key VARCHAR(100) UNIQUE,
      stripe_checkout_session_id VARCHAR(255) UNIQUE,
      stripe_payment_intent_id VARCHAR(255) UNIQUE,
      review_digest VARCHAR(64) NOT NULL,
      amount_cents INT UNSIGNED NOT NULL,
      currency VARCHAR(3) NOT NULL DEFAULT 'AUD',
      status VARCHAR(30) NOT NULL DEFAULT 'creating',
      livemode BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      paid_at TIMESTAMP NULL DEFAULT NULL,
      INDEX enrollment_payment_history (enrollment_id)
    ) ENGINE=InnoDB
  `);

  await db.execute(sql`
    SELECT id, enrollment_id, attempt_key, active_key,
      stripe_checkout_session_id, stripe_payment_intent_id,
      review_digest, amount_cents, currency, status,
      livemode, created_at, updated_at, paid_at
    FROM enrollment_payments
    LIMIT 0
  `);

  console.log("Staging payment table is ready.");
  process.exit(0);
} catch {
  console.error(
    "Payment table setup failed. Check staging configuration and database schema.",
  );
  process.exit(1);
}
