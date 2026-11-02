import { z } from "zod";
import { requireCourseAccess } from "../_core/courseAccess.js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { enrollments } from "../../drizzle/schema.js";

export const studentRouter = router({
    checkCourseAccess: protectedProcedure
    .input(z.object({
      enrollmentId: z.number().int().positive().safe(),
    }))
    .query(async ({ ctx, input }) => {
      ctx.res.setHeader("Cache-Control", "no-store");
      return requireCourseAccess(ctx.user, input.enrollmentId);
    }),
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    ctx.res.setHeader("Cache-Control", "no-store");

    if (ctx.user.role !== "student") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Student access required.",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to load your enrolments.",
      });
    }

    return db
      .select({
        id: enrollments.id,
        courseId: enrollments.courseId,
        yearLevel: enrollments.yearLevel,
        tier: enrollments.tier,
        status: enrollments.status,
        paymentStatus: enrollments.paymentStatus,
        activatedAt: enrollments.activatedAt,
        accessEndsAt: enrollments.accessEndsAt,
      })
      .from(enrollments)
      .where(eq(enrollments.studentId, ctx.user.id));
  }),
});
