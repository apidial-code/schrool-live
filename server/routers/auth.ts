import { createHash, randomBytes } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import {
  getSignInOrigin,
  sendSignInEmail,
} from "../_core/signInEmail.js";
import {
  getUserByEmail,
  saveLoginLink,
  consumeLoginLink,
  revokeLoginSession,
} from "../db.js";

export const LOGIN_LINK_LIFETIME_MS = 15 * 60 * 1000;

export function hashAuthToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createAuthToken() {
  const token = randomBytes(32).toString("hex");
  return { token, tokenHash: hashAuthToken(token) };
}

export function isValidAuthToken(token: unknown): token is string {
  return typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
}

const authProcedure = publicProcedure.use(({ ctx, next }) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  return next();
});

const authMutation = authProcedure.use(({ ctx, next }) => {
  if (ctx.req.headers.origin !== getSignInOrigin()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Invalid request origin.",
    });
  }

  return next();
});

export const authRouter = router({
  me: authProcedure.query(({ ctx }) => ctx.user),

  requestSignIn: authMutation.input(z.object({
    email: z.string().trim().email().max(254),
    rememberDevice: z.boolean().default(false),
  })).mutation(async ({ input }) => {
    const result = {
      success: true,
      message:
        "If this email belongs to an eligible account, a sign-in link will arrive shortly. Please check your spam folder too.",
    };

    const user = await getUserByEmail(input.email);

    if (!user || user.accountStatus !== "active") {
      return result;
    }

    const link = createAuthToken();

    const saved = await saveLoginLink({
      userId: user.id,
      tokenHash: link.tokenHash,
      rememberDevice: input.rememberDevice,
    });

    if (!saved) return result;

    try {
      await sendSignInEmail(user.email, link.token);
    } catch {
      console.error(
        "Sign-in email delivery failed. Check the email service configuration and transactional logs."
      );
    }

    return result;
  }),

  verifySignIn: authMutation.input(z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/),
  })).mutation(async ({ ctx, input }) => {
    const session = createAuthToken();

    const login = await consumeLoginLink({
      linkTokenHash: hashAuthToken(input.token),
      sessionTokenHash: session.tokenHash,
    });

    if (!login) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "This sign-in link has expired, has already been used, or is unavailable. Please request a new link.",
      });
    }

    ctx.res.cookie("__Host-schrool_session", session.token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      ...(login.rememberDevice
        ? { expires: login.expiresAt }
        : {}),
    });

    const destinations: Record<string, string> = {
      student: "/student",
      parent: "/parent",
      teacher: "/teacher",
      consultant: "/",
      admin: "/admin",
    };

    return {
      success: true,
      redirectTo: destinations[login.role] || "/",
    };
  }),

  logout: authMutation.mutation(async ({ ctx }) => {
    if (ctx.sessionTokenHash) {
      await revokeLoginSession(ctx.sessionTokenHash);
    }

    ctx.res.clearCookie("__Host-schrool_session", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }),
});
