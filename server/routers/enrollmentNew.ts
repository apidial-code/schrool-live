import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  consultantProcedure, publicProcedure, router
} from "../_core/trpc.js";
import { getEnrollmentTerms } from "../enrollmentTerms.js";
import { getYear56Quote } from "../enrollmentCatalog.js";
import { enrollments, users } from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import { createHash } from "node:crypto";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
// Keep the existing form contract while replacing the legacy checkout flow.
// An unavailable payment service must never manufacture a paid enrolment.
export const enrollmentNewRouter = router({
    saveDraft: consultantProcedure
    .input(z.object({
      draftRequestId: z.string().uuid(),
      courseKey: z.literal("year5-6"),
      tier: z.enum(["standard", "elite"]),
      paymentOption: z.enum(["full", "deposit50", "deposit25"]),
      family: z.object({
        studentName: z.string().trim().min(1).max(255),
        studentEmail: z.string().trim().email().max(255)
          .transform(value => value.toLowerCase()),
        studentAge: z.string().regex(/^[1-9]\d?$/),
        parentName: z.string().trim().min(1).max(255),
        parentEmail: z.string().trim().email().max(255)
          .transform(value => value.toLowerCase()),
        phone: z.string().trim().min(1).max(50),
      }).strict(),
      preferences: z.object({
        day1: z.enum([
          "Monday", "Tuesday", "Wednesday", "Thursday",
          "Friday", "Saturday", "Sunday",
        ]),
        time1: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        day2: z.enum([
          "Monday", "Tuesday", "Wednesday", "Thursday",
          "Friday", "Saturday", "Sunday",
        ]),
        time2: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
        timezone: z.string().trim().min(1).max(100),
      }).strict().optional(),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (
        ctx.user.accountStatus !== "active" ||
        ctx.req.headers.origin !== getSignInOrigin()
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active consultant access and a valid request origin are required.",
        });
      }

      if (input.family.studentEmail === input.family.parentEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Use separate student and parent email addresses.",
        });
      }

      if (
        input.tier === "standard" &&
        input.paymentOption === "deposit25"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The 25% deposit option is available for Elite only.",
        });
      }

      if (input.tier === "elite") {
        const preferences = input.preferences;

        if (!preferences || preferences.day1 === preferences.day2) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Choose two different Zoom days and a time for each.",
          });
        }

        try {
          new Intl.DateTimeFormat("en-AU", {
            timeZone: preferences.timezone,
          }).format();
        } catch {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Enter a valid time zone, for example Australia/Sydney.",
          });
        }
      }

      // Always calculate prices here. Client-supplied prices are rejected.
      const quote = getYear56Quote(input.tier, input.paymentOption);
      const savedAt = new Date();

      const requestFingerprint = createHash("sha256")
        .update(JSON.stringify(input))
        .digest("hex");

      const snapshot = {
        draftRequestId: input.draftRequestId,
        requestFingerprint,
        snapshotVersion: 1,
        stage: "draft",
        savedAt: savedAt.toISOString(),
        family: input.family,
        quote,
        zoomPreferences:
          input.tier === "elite" ? input.preferences : null,
        zoomScheduleConfirmed: false,
        parentAccepted: false,
        terms: getEnrollmentTerms(input.tier),
      };

            const db = await getDb();

      return db.transaction(async (tx: any) => {
        // Serialise saves by this consultant, including concurrent retries.
        const [consultant] = await tx.select().from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1).for("update");

        if (
          !consultant ||
          consultant.accountStatus !== "active" ||
          !["consultant", "admin"].includes(consultant.role)
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Active consultant access required.",
          });
        }

        const previous = await tx.select().from(enrollments)
          .where(eq(enrollments.consultantId, ctx.user.id))
          .for("update");

        for (const row of previous) {
          let stored;
          try {
            stored = JSON.parse(row.agreementSnapshot || "null");
          } catch {
            continue;
          }

          if (stored?.draftRequestId !== input.draftRequestId) {
            continue;
          }

          if (
            stored.requestFingerprint !== requestFingerprint ||
            row.status !== "draft" ||
            row.paymentStatus !== "unpaid" ||
            row.acceptedAt ||
            row.activatedAt ||
            row.accessEndsAt
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This save reference has already been used. The existing enrolment has not been changed.",
            });
          }

          return {
            enrollmentId: Number(row.id),
            status: "draft" as const,
            paymentStatus: "unpaid" as const,
            accessLocked: true,
            quote: stored.quote as typeof quote,
          };
        }

        // Create a new draft only when this reference has not been saved.
        const [result] = await tx.insert(enrollments).values({
        consultantId: ctx.user.id,
        yearLevel: input.courseKey,
        studentName: input.family.studentName,
        parentEmail: input.family.parentEmail,
        tier: input.tier,
        status: "draft",
        paymentStatus: "unpaid",
        currency: quote.currency,
        paymentPlan: input.paymentOption,
        agreedTotalCents: quote.totalPayableCents,
        agreementSnapshot: JSON.stringify(snapshot),
        userId: null,
        parentId: null,
        studentId: null,
        courseId: null,
        termsVersion: snapshot.terms.version,
        acceptedAt: null,
        acceptanceLinkExpiresAt: null,
        activatedAt: null,
        accessEndsAt: null,
        adjustedCourseFinishAt: null,
        stripeSubscriptionId: null,
        verificationToken: null,
        enrolledAt: null,
      });

      return {
        enrollmentId: Number(result.insertId),
        status: "draft" as const,
        paymentStatus: "unpaid" as const,
        accessLocked: true,
        quote,
      };
      });
    }),
    getDraft: consultantProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
    }).strict())
    .query(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (ctx.user.accountStatus !== "active") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active consultant access required.",
        });
      }

      const db = await getDb();
      const [row] = await db.select().from(enrollments)
        .where(eq(enrollments.id, input.enrollmentId))
        .limit(1);

      if (
        !row ||
        (ctx.user.role !== "admin" &&
          row.consultantId !== ctx.user.id) ||
        row.status !== "draft" ||
        row.paymentStatus !== "unpaid" ||
        row.acceptedAt ||
        row.activatedAt ||
        row.accessEndsAt
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft enrolment unavailable.",
        });
      }

      const amount = z.number().int().nonnegative();
      const snapshotSchema = z.object({
        snapshotVersion: z.literal(1),
        savedAt: z.string().datetime(),
        terms: z.object({
          version: z.string().min(1),
          sections: z.array(z.object({
            title: z.string().min(1),
            text: z.string().min(1),
          })).min(1),
        }).optional(),
        family: z.object({
          studentName: z.string(),
          studentEmail: z.string().email(),
          studentAge: z.string(),
          parentName: z.string(),
          parentEmail: z.string().email(),
          phone: z.string(),
        }),
        zoomPreferences: z.object({
          day1: z.string(),
          time1: z.string(),
          day2: z.string(),
          time2: z.string(),
          timezone: z.string(),
        }).nullable(),
        quote: z.object({
          courseName: z.string(),
          tier: z.enum(["standard", "elite"]),
          paymentOption: z.enum(["full", "deposit50", "deposit25"]),
          currency: z.literal("AUD"),
          totalPayableCents: amount,
          dueNowCents: amount,
          schedule: z.array(z.object({
            monthOffset: amount,
            courseAmountCents: amount,
            administrationFeeCents: amount,
            amountCents: amount,
          })).min(1),
        }),
      });

      let snapshot;
      try {
        snapshot = snapshotSchema.parse(
          JSON.parse(row.agreementSnapshot || "null"),
        );
      } catch {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This draft needs an administrator review.",
        });
      }

      return {
        enrollmentId: Number(row.id),
        status: "draft" as const,
        paymentStatus: "unpaid" as const,
        accessLocked: true,
        savedAt: snapshot.savedAt,
        family: snapshot.family,
        zoomPreferences: snapshot.zoomPreferences,
        quote: snapshot.quote,
        terms: snapshot.terms ?? null,
      };
    }),
    getQuote: consultantProcedure
    .input(z.object({
      courseKey: z.literal("year5-6"),
      tier: z.enum(["standard", "elite"]),
      paymentOption: z.enum(["full", "deposit50", "deposit25"]),
    }))
    .query(({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (ctx.user.accountStatus !== "active") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active consultant access required.",
        });
      }

      if (
        input.tier === "standard" &&
        input.paymentOption === "deposit25"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The 25% deposit option is available for Elite only.",
        });
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
