import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.js";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please sign in.",
      });
    }

    return next({
      ctx: { ...ctx, user: ctx.user },
    });
  }
);

export const consultantProcedure = protectedProcedure.use(
  ({ ctx, next }) => {
    if (!["consultant", "admin"].includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Consultant access required.",
      });
    }

    return next();
  }
);

export const adminProcedure = protectedProcedure.use(
  ({ ctx, next }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Administrator access required.",
      });
    }

    return next();
  }
);
