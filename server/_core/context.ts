import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { createHash } from "node:crypto";
import { getLoginSessionUser } from "../db.js";

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
  let sessionTokenHash: string | null = null;
  const cookieName = "__Host-schrool_session=";

  const matches = (req.headers.cookie || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(cookieName));

  if (matches.length === 1) {
    const token = matches[0].slice(cookieName.length);

    if (/^[a-f0-9]{64}$/.test(token)) {
      sessionTokenHash = createHash("sha256")
        .update(token).digest("hex");

      user = (await getLoginSessionUser(sessionTokenHash)) ?? null;
    }
  }

  return { req, res, user, sessionTokenHash };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
