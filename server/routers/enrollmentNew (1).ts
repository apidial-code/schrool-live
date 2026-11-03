import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { consultantProcedure, publicProcedure, router } from "../_core/trpc.js";

import { getYear56Quote } from "../enrollmentCatalog.js";

// Keep the existing form contract while replacing the legacy checkout flow.
// An unavailable payment service must never manufacture a paid enrolment.
export const enrollmentNewRouter = router({
  getQuote: consultantProcedure
    .input(z.object({
      courseKey: z.literal("year5-6"),
      tier: z.enum(["standard", "elite"]),
      paymentOption: z.enum(["full", "deposit50", "deposit25"]),
    }))
    .query(({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");
      if (ctx.user.accountStatus !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Active consultant access required." });
      }
      if (input.tier === "standard" && input.paymentOption === "deposit25") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "The 25% deposit option is available for Elite only." });
      }
      return getYear56Quote(input.tier, input.paymentOption);
    }),
  createCheckoutSession: publicProcedure
    .input(z.object({
      yearLevel: z.enum(["year5-6", "year7", "year8", "year9"]),
      tier: z.enum(["standard", "elite"]),
      paymentMethod: z.enum(["upfront", "payment-plan"]),
      studentName: z.string().trim().min(1).max(255),
      studentEmail: z.string().trim().email().max(255),
      studentAge: z.string().min(1).max(20),
      parentName: z.string().trim().min(1).max(255),
      parentEmail: z.string().trim().email().max(255),
      phone: z.string().trim().min(1).max(50),
      preferredDays: z.string().max(1000).optional(),
    }))
    .mutation(async ({ ctx }): Promise<{ url: string; sessionId: string }> => {
      ctx.res.setHeader("Cache-Control", "no-store");
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Enrolment checkout is being updated. No payment has been taken and no enrolment has been activated.",
      });
    }),
  getEnrollmentBySession: publicProcedure
    .input(z.object({ sessionId: z.string().min(1).max(255) }))
    .query(async ({ ctx }): Promise<{
      enrollmentId: number;
      studentName: string;
      yearLevel: string;
      tier: string;
      status: string;
    }> => {
      ctx.res.setHeader("Cache-Control", "no-store");
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Payment confirmation is not available through this legacy page. Please check your enrolments after signing in.",
      });
    }),
});
