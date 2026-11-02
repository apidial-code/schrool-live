import { randomInt, randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { enrollments, lessons, lessonQuestions, lessonAttempts } from "../../drizzle/schema.js";
import { requireCourseAccess } from "../_core/courseAccess.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { protectedProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";

const courseInput = z.object({ enrollmentId: z.number().int().positive().safe() });
const lessonInput = courseInput.extend({ lessonId: z.number().int().positive().safe() });
const difficulty = z.enum(["easy", "medium", "challenging"]);
const attemptInput = lessonInput.extend({ attemptToken: z.string().uuid() });
const guid = z.string().uuid();
const questionSchema = z.object({
  sourceId: z.string().min(1).max(40),
  questionText: z.string().min(1),
  diagram: z.string().nullable(),
  options: z.array(z.string()).min(2).max(10),
  correctAnswer: z.string(),
  solutionVideoId: guid.nullable(),
  bunnyLibraryId: z.number().int().positive().nullable(),
});
type Question = z.infer<typeof questionSchema>;
type Attempt = typeof lessonAttempts.$inferSelect;
const snapshotSchema = z.array(questionSchema).length(10);
const answersSchema = z.record(z.string(), z.number().int().min(0).max(9));
const viewedSchema = z.array(z.string());

function unavailable(message = "Exercise attempt unavailable."): never {
  throw new TRPCError({ code: "NOT_FOUND", message });
}
function readAttempt(row: Attempt) {
  return {
    questions: snapshotSchema.parse(JSON.parse(row.questionSnapshot)),
    answers: answersSchema.parse(JSON.parse(row.answersJson)),
    viewed: viewedSchema.parse(JSON.parse(row.solutionViewedJson)),
  };
}
export function gradeQuestions(questions: Question[], answers: Record<string, number>, viewed: string[]) {
  let rawScore = 0, validScore = 0;
  for (const q of questions) {
    if (answers[q.sourceId] === undefined || answers[q.sourceId] >= q.options.length) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Answer all 10 questions before submitting." });
    }
    if (q.options[answers[q.sourceId]] === q.correctAnswer) {
      rawScore++;
      if (!viewed.includes(q.sourceId)) validScore++;
    }
  }
  return { rawScore, validScore };
}
export function publicAttempt(row: Attempt) {
  const { questions, answers, viewed } = readAttempt(row);
  return {
    attemptToken: row.attemptToken,
    difficulty: row.difficulty,
    status: row.status,
    answers,
    solutionViewed: viewed,
    rawScore: row.status === "submitted" ? row.rawScore : null,
    validScore: row.status === "submitted" ? row.validScore : null,
    submittedAt: row.submittedAt,
    questions: questions.map(q => ({
      sourceId: q.sourceId,
      questionText: q.questionText,
      diagram: q.diagram,
      options: q.options,
      hasSolution: !!q.solutionVideoId && !!q.bunnyLibraryId,
    })),
  };
}
const courseProcedure = protectedProcedure.input(courseInput).use(async ({ ctx, input, next }) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  const access = await requireCourseAccess(ctx.user, input.enrollmentId);
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to load lessons." });
  return next({ ctx: { ...ctx, access, db } });
});
const lessonProcedure = courseProcedure.input(lessonInput).use(async ({ ctx, input, next }) => {
  const [lesson] = await ctx.db.select({
    id: lessons.id, title: lessons.title, orderIndex: lessons.orderIndex,
    bunnyLibraryId: lessons.bunnyLibraryId, bunnyVideoId: lessons.bunnyVideoId,
  }).from(lessons).where(and(eq(lessons.id, input.lessonId), eq(lessons.courseId, ctx.access.courseId))).limit(1);
  if (!lesson) unavailable("Lesson unavailable.");
  return next({ ctx: { ...ctx, lesson } });
});
const lessonMutation = lessonProcedure.use(({ ctx, next }) => {
  if (ctx.req.headers.origin !== getSignInOrigin()) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Invalid request origin." });
  }
  return next();
});
// Lock one enrolment before changing attempts: concurrent tabs cannot overwrite
// answers or create two active attempts for the same difficulty.
async function lockAccess(tx: any, studentId: number, enrollmentId: number, courseId: number) {
  const [record] = await tx.select().from(enrollments).where(and(
    eq(enrollments.id, enrollmentId), eq(enrollments.studentId, studentId),
  )).for("update");
  const now = Date.now();
  if (!record || record.courseId !== courseId || record.status !== "active" ||
      record.paymentStatus !== "paid" || !record.acceptedAt || !record.activatedAt ||
      !record.accessEndsAt || !(record.acceptedAt.getTime() <= now) ||
      !(record.activatedAt.getTime() <= now) || !(record.accessEndsAt.getTime() > now)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Course access unavailable." });
  }
}
function attemptWhere(studentId: number, input: z.infer<typeof attemptInput>) {
  return and(eq(lessonAttempts.studentId, studentId),
    eq(lessonAttempts.enrollmentId, input.enrollmentId),
    eq(lessonAttempts.lessonId, input.lessonId),
    eq(lessonAttempts.attemptToken, input.attemptToken));
}
async function findAttempt(db: any, studentId: number, input: z.infer<typeof attemptInput>): Promise<Attempt> {
  const [row] = await db.select().from(lessonAttempts).where(attemptWhere(studentId, input)).limit(1);
  if (!row) unavailable();
  return row;
}
async function progress(db: any, studentId: number, enrollmentId: number, lessonId: number) {
  const rows = await db.select({ difficulty: lessonAttempts.difficulty,
    best: sql<number>`MAX(${lessonAttempts.validScore})`,
    count: sql<number>`COUNT(*)`,
  }).from(lessonAttempts).where(and(eq(lessonAttempts.studentId, studentId),
    eq(lessonAttempts.enrollmentId, enrollmentId), eq(lessonAttempts.lessonId, lessonId),
    eq(lessonAttempts.status, "submitted"))).groupBy(lessonAttempts.difficulty);
  const result = { easy: { bestScore: 0, attempts: 0, unlocked: true },
    medium: { bestScore: 0, attempts: 0, unlocked: false },
    challenging: { bestScore: 0, attempts: 0, unlocked: false } };
  for (const row of rows) {
    const level = difficulty.safeParse(row.difficulty);
    if (level.success) {
      result[level.data].bestScore = Number(row.best) || 0;
      result[level.data].attempts = Number(row.count) || 0;
    }
  }
  result.medium.unlocked = result.easy.bestScore >= 8;
  result.challenging.unlocked = result.medium.unlocked && result.medium.bestScore >= 8;
  return result;
}
export const lessonsRouter = router({
  list: courseProcedure.query(({ ctx }) => ctx.db.select({ id: lessons.id,
    title: lessons.title, orderIndex: lessons.orderIndex }).from(lessons)
    .where(eq(lessons.courseId, ctx.access.courseId)).orderBy(asc(lessons.orderIndex), asc(lessons.id))),
  getById: lessonProcedure.query(({ ctx }) => ctx.lesson),
  getExercises: lessonProcedure.query(async ({ ctx, input }) => {
    const levels = await progress(ctx.db, ctx.user.id, input.enrollmentId, input.lessonId);
    const active = await ctx.db.select({ attemptToken: lessonAttempts.attemptToken,
      difficulty: lessonAttempts.difficulty }).from(lessonAttempts).where(and(
      eq(lessonAttempts.studentId, ctx.user.id), eq(lessonAttempts.enrollmentId, input.enrollmentId),
      eq(lessonAttempts.lessonId, input.lessonId), eq(lessonAttempts.status, "in_progress")));
    const history = await ctx.db.select({ attemptToken: lessonAttempts.attemptToken,
      difficulty: lessonAttempts.difficulty, rawScore: lessonAttempts.rawScore,
      validScore: lessonAttempts.validScore, submittedAt: lessonAttempts.submittedAt,
    }).from(lessonAttempts).where(and(eq(lessonAttempts.studentId, ctx.user.id),
      eq(lessonAttempts.enrollmentId, input.enrollmentId), eq(lessonAttempts.lessonId, input.lessonId),
      eq(lessonAttempts.status, "submitted"))).orderBy(desc(lessonAttempts.id)).limit(20);
    const [count] = await ctx.db.select({ count: sql<number>`COUNT(*)` }).from(lessonQuestions)
      .where(eq(lessonQuestions.lessonId, input.lessonId));
    return { levels, active, history, available: Number(count.count) > 0 };
  }),
  startAttempt: lessonMutation.input(lessonInput.extend({ difficulty })).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx: any) => {
      await lockAccess(tx, ctx.user.id, input.enrollmentId, ctx.access.courseId);
      const levels = await progress(tx, ctx.user.id, input.enrollmentId, input.lessonId);
      if (!levels[input.difficulty].unlocked) throw new TRPCError({ code: "FORBIDDEN", message: "Pass the previous difficulty with 8/10 first." });
      const activeKey = `${ctx.user.id}:${input.enrollmentId}:${input.lessonId}:${input.difficulty}`;
      const [existing] = await tx.select().from(lessonAttempts).where(eq(lessonAttempts.activeKey, activeKey));
      if (existing) {
        if (existing.studentId !== ctx.user.id || existing.enrollmentId !== input.enrollmentId ||
            existing.lessonId !== input.lessonId || existing.difficulty !== input.difficulty ||
            existing.status !== "in_progress") unavailable();
        return publicAttempt(existing);
      }
      const rows = await tx.select().from(lessonQuestions).where(and(
        eq(lessonQuestions.lessonId, input.lessonId), eq(lessonQuestions.difficulty, input.difficulty),
      )).orderBy(asc(lessonQuestions.orderIndex), asc(lessonQuestions.id));
      if (rows.length !== 10) unavailable("This exercise set is not available yet.");
      const questions = snapshotSchema.parse(rows.map((row: typeof lessonQuestions.$inferSelect) => {
        const options = z.array(z.string()).min(2).max(10).parse(JSON.parse(row.optionsJson));
        if (!options.includes(row.correctAnswer)) unavailable("This exercise set needs a content correction.");
        for (let i = options.length - 1; i > 0; i--) {
          const j = randomInt(i + 1); [options[i], options[j]] = [options[j], options[i]];
        }
        return { sourceId: row.sourceId, questionText: row.questionText, diagram: row.diagram,
          options, correctAnswer: row.correctAnswer, solutionVideoId: row.solutionVideoId,
          bunnyLibraryId: ctx.lesson.bunnyLibraryId };
      }));
      if (new Set(questions.map(q => q.sourceId)).size !== 10) unavailable("Invalid exercise set.");
      const attemptToken = randomUUID();
      await tx.insert(lessonAttempts).values({ attemptToken, activeKey, studentId: ctx.user.id,
        enrollmentId: input.enrollmentId, lessonId: input.lessonId, difficulty: input.difficulty,
        status: "in_progress", questionSnapshot: JSON.stringify(questions), answersJson: "{}", solutionViewedJson: "[]" });
      return publicAttempt(await findAttempt(tx, ctx.user.id, { ...input, attemptToken }));
    });
  }),
  getAttempt: lessonProcedure.input(attemptInput).query(async ({ ctx, input }) =>
    publicAttempt(await findAttempt(ctx.db, ctx.user.id, input))),
  saveAnswer: lessonMutation.input(attemptInput.extend({ sourceId: z.string().min(1).max(40),
    optionIndex: z.number().int().min(0).max(9) })).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx: any) => {
      await lockAccess(tx, ctx.user.id, input.enrollmentId, ctx.access.courseId);
      const row = await findAttempt(tx, ctx.user.id, input);
      if (row.status !== "in_progress") throw new TRPCError({ code: "CONFLICT", message: "This attempt has already been submitted." });
      const data = readAttempt(row), q = data.questions.find(q => q.sourceId === input.sourceId);
      if (!q || input.optionIndex >= q.options.length) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid answer selection." });
      data.answers[q.sourceId] = input.optionIndex;
      await tx.update(lessonAttempts).set({ answersJson: JSON.stringify(data.answers), updatedAt: new Date() })
        .where(eq(lessonAttempts.id, row.id));
      return publicAttempt({ ...row, answersJson: JSON.stringify(data.answers) });
    });
  }),
  viewSolution: lessonMutation.input(attemptInput.extend({ sourceId: z.string().min(1).max(40) }))
    .mutation(async ({ ctx, input }) => ctx.db.transaction(async (tx: any) => {
      await lockAccess(tx, ctx.user.id, input.enrollmentId, ctx.access.courseId);
      const row = await findAttempt(tx, ctx.user.id, input), data = readAttempt(row);
      const q = data.questions.find(q => q.sourceId === input.sourceId);
      if (!q || !q.solutionVideoId || !q.bunnyLibraryId) unavailable("Solution video is not available yet.");
      if (row.status === "in_progress" && !data.viewed.includes(q.sourceId)) {
        data.viewed.push(q.sourceId);
        await tx.update(lessonAttempts).set({ solutionViewedJson: JSON.stringify(data.viewed), updatedAt: new Date() })
          .where(eq(lessonAttempts.id, row.id));
      }
      return { sourceId: q.sourceId,
        url: `https://iframe.mediadelivery.net/embed/${q.bunnyLibraryId}/${q.solutionVideoId}?autoplay=false&muted=false&preload=false&responsive=true`,
        attempt: publicAttempt({ ...row, solutionViewedJson: row.status === "in_progress" ? JSON.stringify(data.viewed) : row.solutionViewedJson }) };
    })),
  submitAttempt: lessonMutation.input(attemptInput).mutation(async ({ ctx, input }) => {
    return ctx.db.transaction(async (tx: any) => {
      await lockAccess(tx, ctx.user.id, input.enrollmentId, ctx.access.courseId);
      const row = await findAttempt(tx, ctx.user.id, input);
      if (row.status === "submitted") return publicAttempt(row);
      if (row.status !== "in_progress") unavailable();
      const data = readAttempt(row), score = gradeQuestions(data.questions, data.answers, data.viewed);
      const changes = { ...score, status: "submitted", activeKey: null, submittedAt: new Date(), updatedAt: new Date() };
      await tx.update(lessonAttempts).set(changes).where(eq(lessonAttempts.id, row.id));
      return publicAttempt({ ...row, ...changes });
    });
  }),
});
