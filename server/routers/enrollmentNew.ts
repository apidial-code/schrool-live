import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  consultantProcedure, publicProcedure, router
} from "../_core/trpc.js";
import { enrollmentSnapshotSchema } from "../enrollmentAgreement.js";
import { getEnrollmentTerms } from "../enrollmentTerms.js";
import { getYear56Quote } from "../enrollmentCatalog.js";
import {
  enrollments, enrollmentPayments, users,
} from "../../drizzle/schema.js";
import { eq } from "drizzle-orm";
import {
  createHash, randomBytes, randomUUID,
} from "node:crypto";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { getTestStripe } from "../_core/stripeTest.js";
// Keep the existing form contract while replacing the legacy checkout flow.
// An unavailable payment service must never manufacture a paid enrolment.
export const enrollmentNewRouter = router({
    createParentCheckout: publicProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
      token: z.string().regex(/^[a-f0-9]{64}$/),
    }).strict())
    .mutation(async ({ ctx, input }): Promise<{ url: string }> => {
      ctx.res.setHeader("Cache-Control", "no-store");

      const origin = getSignInOrigin();

      if (
        origin !==
          "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
        ctx.req.headers.origin !== origin
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Staging checkout requires a valid request origin.",
        });
      }

      const stripe = getTestStripe();
      const db = await getDb();

      // Save the attempt before contacting Stripe.
      const reserved = await db.transaction(async (tx: any) => {
        const [row] = await tx.select().from(enrollments)
          .where(eq(enrollments.id, input.enrollmentId))
          .limit(1).for("update");

        const tokenHash = createHash("sha256")
          .update(input.token).digest("hex");

        if (
          !row ||
          row.verificationToken !== tokenHash ||
          !row.acceptanceLinkExpiresAt ||
          row.acceptanceLinkExpiresAt.getTime() <= Date.now() ||
          !row.acceptedAt ||
          row.status !== "draft" ||
          row.paymentStatus !== "unpaid" ||
          row.activatedAt ||
          row.accessEndsAt
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "An accepted, unpaid agreement and valid review link are required.",
          });
        }

        let stored;
        let snapshot;

        try {
          stored = JSON.parse(row.agreementSnapshot || "null");
          snapshot = enrollmentSnapshotSchema.parse(stored);
        } catch {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This enrolment needs an administrator review.",
          });
        }

        const reviewDigest = createHash("sha256")
          .update(JSON.stringify(snapshot)).digest("hex");

        if (
          !snapshot.terms ||
          stored.parentAccepted !== true ||
          stored.acceptance?.acceptsAgreement !== true ||
          stored.acceptance?.confirmsAuthority !== true ||
          stored.acceptance?.reviewDigest !== reviewDigest ||
          stored.acceptance?.termsVersion !== snapshot.terms.version ||
          row.termsVersion !== snapshot.terms.version ||
          row.parentEmail !== snapshot.family.parentEmail ||
          row.tier !== snapshot.quote.tier ||
          row.paymentPlan !== snapshot.quote.paymentOption ||
          row.currency !== "AUD" ||
          snapshot.quote.currency !== "AUD" ||
          row.agreedTotalCents !== snapshot.quote.totalPayableCents ||
          snapshot.quote.dueNowCents <= 0 ||
          snapshot.quote.dueNowCents !==
            snapshot.quote.schedule[0].amountCents ||
          snapshot.quote.schedule[0].monthOffset !== 0
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "The accepted agreement and payment details do not match.",
          });
        }

        const activeKey = `initial:${row.id}`;

        const [existing] = await tx.select().from(enrollmentPayments)
          .where(eq(enrollmentPayments.activeKey, activeKey))
          .limit(1).for("update");

        if (existing) {
          if (
            existing.reviewDigest !== reviewDigest ||
            existing.amountCents !== snapshot.quote.dueNowCents ||
            existing.currency !== "AUD" ||
            existing.livemode !== false ||
            !["creating", "open"].includes(existing.status)
          ) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "This payment attempt needs an administrator review.",
            });
          }

          return { payment: existing, snapshot };
        }

        const attemptKey = randomUUID();

        const [result] = await tx.insert(enrollmentPayments).values({
          enrollmentId: Number(row.id),
          attemptKey,
          activeKey,
          reviewDigest,
          amountCents: snapshot.quote.dueNowCents,
          currency: "AUD",
          status: "creating",
          livemode: false,
        });

        const [payment] = await tx.select().from(enrollmentPayments)
          .where(eq(enrollmentPayments.id, result.insertId))
          .limit(1);

        if (!payment) {
          throw new Error("Payment attempt could not be retrieved.");
        }

        return { payment, snapshot };
      });

      const { payment, snapshot } = reserved;

      // Stop uncertain old attempts before Stripe can discard their retry key.
      if (
        !payment.stripeCheckoutSessionId &&
        Date.now() - payment.createdAt.getTime() >
          20 * 60 * 60 * 1000
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This checkout attempt needs an administrator review.",
        });
      }

      let session;

      try {
        session = payment.stripeCheckoutSessionId
          ? await stripe.checkout.sessions.retrieve(
              payment.stripeCheckoutSessionId,
            )
          : await stripe.checkout.sessions.create({
              mode: "payment",
              payment_method_types: ["card"],
              customer_creation: "always",
              customer_email: snapshot.family.parentEmail,
              client_reference_id: String(payment.enrollmentId),
              line_items: [{
                quantity: 1,
                price_data: {
                  currency: "aud",
                  unit_amount: payment.amountCents,
                  product_data: {
                    name: `${snapshot.quote.courseName} - ${
                      snapshot.quote.tier
                    } - ${
                      snapshot.quote.paymentOption === "full"
                        ? "full payment"
                        : "initial deposit"
                    }`,
                  },
                },
              }],
              metadata: {
                enrollmentId: String(payment.enrollmentId),
                attemptKey: payment.attemptKey,
                reviewDigest: payment.reviewDigest,
                purpose: "initial_enrollment",
              },
              payment_intent_data: {
                setup_future_usage:
                  snapshot.quote.paymentOption === "full"
                    ? undefined
                    : "off_session",
                metadata: {
                  enrollmentId: String(payment.enrollmentId),
                  attemptKey: payment.attemptKey,
                },
              },
              success_url:
                `${origin}/enrollment/payment-return` +
                "?session_id={CHECKOUT_SESSION_ID}",
              cancel_url:
                `${origin}/enrollment/payment-return?cancelled=1`,
            }, {
              idempotencyKey: payment.attemptKey,
            });
      } catch {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Checkout could not be opened. Please try again or contact your consultant.",
        });
      }

      if (
        session.livemode ||
        session.mode !== "payment" ||
        session.client_reference_id !== String(payment.enrollmentId) ||
        session.metadata?.attemptKey !== payment.attemptKey ||
        session.metadata?.reviewDigest !== payment.reviewDigest ||
        session.amount_total !== payment.amountCents ||
        session.currency !== "aud"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Checkout details could not be verified.",
        });
      }

      // Persist the Stripe reference without overwriting a paid status.
      await db.transaction(async (tx: any) => {
        const [current] = await tx.select().from(enrollmentPayments)
          .where(eq(enrollmentPayments.id, payment.id))
          .limit(1).for("update");

        if (
          !current ||
          (current.stripeCheckoutSessionId &&
            current.stripeCheckoutSessionId !== session.id)
        ) {
          throw new Error("Checkout reference does not match.");
        }

        await tx.update(enrollmentPayments).set({
          stripeCheckoutSessionId: session.id,
          ...(current.status === "creating"
            ? { status: "open" }
            : {}),
        }).where(eq(enrollmentPayments.id, payment.id));
      });

      if (
        session.status !== "open" ||
        session.payment_status !== "unpaid" ||
        !session.url
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This checkout is completed or expired. Please contact your consultant.",
        });
      }

      const checkoutUrl = new URL(session.url);

      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Unexpected checkout address.");
      }

      return { url: checkoutUrl.toString() };
    }),
    acceptParentReview: publicProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
      token: z.string().regex(/^[a-f0-9]{64}$/),
      termsVersion: z.string().min(1).max(100),
      reviewDigest: z.string().regex(/^[a-f0-9]{64}$/),
      acceptedName: z.string().trim().min(2).max(255),
      acceptsAgreement: z.literal(true),
      confirmsAuthority: z.literal(true),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (ctx.req.headers.origin !== getSignInOrigin()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid request origin.",
        });
      }

      const db = await getDb();

      return db.transaction(async (tx: any) => {
        const [row] = await tx.select().from(enrollments)
          .where(eq(enrollments.id, input.enrollmentId))
          .limit(1).for("update");

        const tokenHash = createHash("sha256")
          .update(input.token).digest("hex");

        if (
          !row ||
          row.verificationToken !== tokenHash ||
          !row.acceptanceLinkExpiresAt ||
          row.acceptanceLinkExpiresAt.getTime() <= Date.now() ||
          row.status !== "draft" ||
          row.paymentStatus !== "unpaid" ||
          row.activatedAt ||
          row.accessEndsAt
        ) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "This review link is unavailable or has expired. Please contact your consultant.",
          });
        }

        let stored;
        let snapshot;

        try {
          stored = JSON.parse(row.agreementSnapshot || "null");
          snapshot = enrollmentSnapshotSchema.parse(stored);
        } catch {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This enrolment needs an administrator review.",
          });
        }

        const reviewDigest = createHash("sha256")
          .update(JSON.stringify(snapshot)).digest("hex");

        if (
          !snapshot.terms ||
          snapshot.terms.version !== input.termsVersion ||
          row.termsVersion !== snapshot.terms.version ||
          reviewDigest !== input.reviewDigest ||
          row.parentEmail !== snapshot.family.parentEmail ||
          row.tier !== snapshot.quote.tier ||
          row.paymentPlan !== snapshot.quote.paymentOption ||
          row.currency !== snapshot.quote.currency ||
          row.agreedTotalCents !== snapshot.quote.totalPayableCents
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "The agreement could not be confirmed. Please reopen your review link.",
          });
        }

        // A retry returns the original acceptance.
        if (row.acceptedAt) {
          return {
            enrollmentId: Number(row.id),
            acceptedAt: row.acceptedAt.toISOString(),
            paymentStatus: "unpaid" as const,
            accessLocked: true,
          };
        }

        const acceptedAt = new Date();

        await tx.update(enrollments).set({
          acceptedAt,
          agreementSnapshot: JSON.stringify({
            ...stored,
            parentAccepted: true,
            acceptance: {
              acceptedAt: acceptedAt.toISOString(),
              acceptedName: input.acceptedName,
              parentEmail: snapshot.family.parentEmail,
              termsVersion: snapshot.terms.version,
              reviewDigest,
              acceptsAgreement: true,
              confirmsAuthority: true,
            },
          }),
        }).where(eq(enrollments.id, row.id));

        return {
          enrollmentId: Number(row.id),
          acceptedAt: acceptedAt.toISOString(),
          paymentStatus: "unpaid" as const,
          accessLocked: true,
        };
      });
    }),
    openParentReview: publicProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
      token: z.string().regex(/^[a-f0-9]{64}$/),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (ctx.req.headers.origin !== getSignInOrigin()) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid request origin.",
        });
      }

      const db = await getDb();
      const [row] = await db.select().from(enrollments)
        .where(eq(enrollments.id, input.enrollmentId))
        .limit(1);

      const tokenHash = createHash("sha256")
        .update(input.token).digest("hex");

      if (
        !row ||
        row.verificationToken !== tokenHash ||
        !row.acceptanceLinkExpiresAt ||
        row.acceptanceLinkExpiresAt.getTime() <= Date.now() ||
        row.status !== "draft" ||
        row.paymentStatus !== "unpaid" ||
        row.activatedAt ||
        row.accessEndsAt
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This review link is unavailable or has expired. Please contact your consultant.",
        });
      }

      let snapshot;
      try {
        snapshot = enrollmentSnapshotSchema.parse(
          JSON.parse(row.agreementSnapshot || "null"),
        );
      } catch {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This enrolment needs an administrator review.",
        });
      }

      if (
        !snapshot.terms ||
        row.termsVersion !== snapshot.terms.version ||
        row.parentEmail !== snapshot.family.parentEmail ||
        row.tier !== snapshot.quote.tier ||
        row.paymentPlan !== snapshot.quote.paymentOption ||
        row.currency !== snapshot.quote.currency ||
        row.agreedTotalCents !== snapshot.quote.totalPayableCents
      ) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "This enrolment needs an administrator review.",
        });
      }

      return {
        enrollmentId: Number(row.id),
        family: snapshot.family,
        quote: snapshot.quote,
        zoomPreferences: snapshot.zoomPreferences,
        terms: snapshot.terms,
        reviewDigest: createHash("sha256")
          .update(JSON.stringify(snapshot)).digest("hex"),
        acceptedAt: row.acceptedAt?.toISOString() ?? null,
        paymentStatus: "unpaid" as const,
        accessLocked: true,
      };
    }),
    createParentReviewLink: consultantProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
    }).strict())
    .mutation(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");

      if (
        ctx.user.accountStatus !== "active" ||
        ctx.req.headers.origin !== getSignInOrigin()
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Active consultant access and a valid origin are required.",
        });
      }

      const db = await getDb();

      return db.transaction(async (tx: any) => {
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

        const [row] = await tx.select().from(enrollments)
          .where(eq(enrollments.id, input.enrollmentId))
          .limit(1).for("update");

        if (
          !row ||
          (consultant.role !== "admin" &&
            row.consultantId !== consultant.id) ||
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

        let snapshot;
        try {
          snapshot = enrollmentSnapshotSchema.parse(
            JSON.parse(row.agreementSnapshot || "null"),
          );
        } catch {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This draft needs an administrator review.",
          });
        }

        if (
          !snapshot.terms ||
          row.termsVersion !== snapshot.terms.version ||
          row.parentEmail !== snapshot.family.parentEmail ||
          row.tier !== snapshot.quote.tier ||
          row.paymentPlan !== snapshot.quote.paymentOption ||
          row.currency !== snapshot.quote.currency ||
          row.agreedTotalCents !== snapshot.quote.totalPayableCents
        ) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "This draft needs complete, matching saved terms and pricing.",
          });
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256")
          .update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await tx.update(enrollments).set({
          verificationToken: tokenHash,
          acceptanceLinkExpiresAt: expiresAt,
        }).where(eq(enrollments.id, row.id));

        const link = new URL("/enrollment/review", getSignInOrigin());
        link.hash = new URLSearchParams({
          enrollmentId: String(row.id),
          token,
        }).toString();

        return {
          enrollmentId: Number(row.id),
          url: link.toString(),
          expiresAt: expiresAt.toISOString(),
        };
      });
    }),
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
        row.activatedAt ||
        row.accessEndsAt
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Draft enrolment unavailable.",
        });
      }

      const snapshotSchema = enrollmentSnapshotSchema;

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
        acceptedAt: row.acceptedAt?.toISOString() ?? null,
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
