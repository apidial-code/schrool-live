import { createHash, randomBytes } from "node:crypto";
import { publicProcedure, router } from "../_core/trpc.js";

export const LOGIN_LINK_LIFETIME_MS = 15 * 60 * 1000;

export function hashAuthToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createAuthToken() {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    tokenHash: hashAuthToken(token),
  };
}

export function isValidAuthToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("__Host-schrool_session", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }),
});
