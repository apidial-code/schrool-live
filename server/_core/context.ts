import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../db.js";
import { users } from "../../drizzle/schema.js";

export type SessionUser = {
  id: number;
  name: string | null;
  email: string | null;
  role: string;
  accountStatus: string;
};

export async function createContext({
  req,
  res,
}: CreateExpressContextOptions) {
  let user: SessionUser | null = null;
  const secret = process.env.JWT_SECRET;

  const matches = (req.headers.cookie || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) =>
      cookie.startsWith("__Host-schrool_session=")
    );

  let userId: number | undefined;

  if (secret && secret.length >= 64 && matches.length === 1) {
    try {
      const token = decodeURIComponent(
        matches[0].slice("__Host-schrool_session=".length)
      );

      const payload = jwt.verify(token, secret, {
        algorithms: ["HS256"],
        issuer: "schrool-platform",
        audience: "schrool-session",
      });

      if (
        typeof payload !== "string" &&
        payload.purpose === "session" &&
        typeof payload.exp === "number" &&
        typeof payload.sub === "string" &&
        /^[1-9]\d*$/.test(payload.sub)
      ) {
        const id = Number(payload.sub);
        if (Number.isSafeInteger(id)) userId = id;
      }
    } catch {
      // Invalid or expired sessions remain signed out.
    }
  }

  if (userId !== undefined) {
    const db = await getDb();

    const [account] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      accountStatus: users.accountStatus,
    }).from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (
      account &&
      account.accountStatus === "active" &&
      ["student", "parent", "teacher", "consultant", "admin"]
        .includes(account.role)
    ) {
      user = account;
    }
  }

  return { req, res, user };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
