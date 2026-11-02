import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { lessons } from "../../drizzle/schema.js";
import { requireCourseAccess } from "../_core/courseAccess.js";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";

const courseInput = z.object({
  enrollmentId: z.number().int().positive().safe(),
});

const lessonInput = courseInput.extend({
  lessonId: z.number().int().positive().safe(),
});

const courseProcedure = protectedProcedure
  .input(courseInput)
  .use(async ({ ctx, input, next }) => {
    ctx.res.setHeader("Cache-Control", "no-store");

    const access = await requireCourseAccess(
      ctx.user,
      input.enrollmentId,
    );

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to load lessons.",
      });
    }

    return next({ ctx: { ...ctx, access, db } });
  });

const lessonProcedure = courseProcedure
  .input(lessonInput)
  .use(async ({ ctx, input, next }) => {
    const [lesson] = await ctx.db
      .select({
        id: lessons.id,
        title: lessons.title,
        orderIndex: lessons.orderIndex,
        bunnyLibraryId: lessons.bunnyLibraryId,
        bunnyVideoId: lessons.bunnyVideoId,
      })
      .from(lessons)
      .where(and(
        eq(lessons.id, input.lessonId),
        eq(lessons.courseId, ctx.access.courseId),
      ))
      .limit(1);

    if (!lesson) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Lesson unavailable.",
      });
    }

    return next({ ctx: { ...ctx, lesson } });
  });

export const lessonsRouter = router({
  list: courseProcedure.query(async ({ ctx }) => {
    return ctx.db
      .select({
        id: lessons.id,
        title: lessons.title,
        orderIndex: lessons.orderIndex,
      })
      .from(lessons)
      .where(eq(lessons.courseId, ctx.access.courseId))
      .orderBy(asc(lessons.orderIndex), asc(lessons.id));
  }),

  getById: lessonProcedure.query(({ ctx }) => ctx.lesson),

  getExercises: lessonProcedure.query(() => {
    throw new TRPCError({
      code: "NOT_IMPLEMENTED",
      message: "Lesson exercises are not available yet.",
    });
  }),
});
