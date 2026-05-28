import { randomBytes } from "crypto";
import { getDb } from "../db";
import { magicLinkTokens } from "../../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";

/**
 * Generate a secure random token for magic link authentication
 */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

/**
 * Create a magic link token for a user
 * @param userId - The user ID to create the token for
 * @param expiryMinutes - How many minutes until the token expires (default: 60)
 * @returns The generated token string
 */
export async function createMagicLinkToken(
  userId: number,
  expiryMinutes: number = 60
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  const db = await getDb();
  if (!db) {
    throw new Error("Database unavailable");
  }
  
  await db.insert(magicLinkTokens).values({
    token,
    userId,
    expiresAt,
    used: 0,
  });

  return token;
}

/**
 * Verify and consume a magic link token
 * @param token - The token to verify
 * @returns The user ID if valid, null if invalid/expired/used
 */
export async function verifyMagicLinkToken(
  token: string
): Promise<number | null> {
  // Support JWT tokens for mock mode
  if (token.includes('.')) {
    try {
      const jwt = (await import('jsonwebtoken')).default;
      const { ENV } = await import('./env');
      const decoded = jwt.verify(token, ENV.jwtSecret || 'demo-secret') as any;
      return decoded.userId;
    } catch (error) {
      console.error("[Magic Link] JWT verification failed:", error);
    }
  }

  const now = new Date();
  const db = await getDb();
  if (!db) {
    throw new Error("Database unavailable");
  }

  // Find unused, non-expired token
  const [tokenRecord] = await db
    .select()
    .from(magicLinkTokens)
    .where(
      and(
        eq(magicLinkTokens.token, token),
        eq(magicLinkTokens.used, 0),
        gt(magicLinkTokens.expiresAt, now)
      )
    )
    .limit(1);

  if (!tokenRecord) {
    return null;
  }

  // Mark token as used
  await db
    .update(magicLinkTokens)
    .set({ used: 1 })
    .where(eq(magicLinkTokens.id, tokenRecord.id));

  return tokenRecord.userId;
}

/**
 * Generate a magic link URL for a user
 * @param userId - The user ID
 * @param baseUrl - The base URL of the application
 * @returns The full magic link URL
 */
export async function generateMagicLink(
  userId: number,
  baseUrl: string
): Promise<string> {
  const token = await createMagicLinkToken(userId);
  return `${baseUrl}/auth/magic?token=${token}`;
}
