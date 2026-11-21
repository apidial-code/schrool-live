import { randomUUID } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { and, eq, gte, inArray } from "drizzle-orm";
import { z } from "zod";
import { enrollments, lessons, lessonAttempts, studentFileEntries, eliteTeachingSessions, eliteSessionReports, eliteReplacements, eliteScheduleLock } from "../../drizzle/schema.js";
import { adminProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { sydneyDate } from "../../shared/standardSupport.js";

import { teachingComplete } from "../../shared/eliteReplacement.js";

const adminChange = adminProcedure.use(async ({ ctx, next }) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  if (ctx.user.accountStatus !== "active" || ctx.req.headers.origin !== getSignInOrigin())
    throw new TRPCError({ code: "FORBIDDEN", message: "Active Admin access and a valid origin are required." });
  return next();
});
export const eliteLifecycleRouter = router({
  update: adminChange.input(z.discriminatedUnion("action", [
    z.object({ action: z.literal("completion_access"), enrollmentId: z.number().int().positive().safe() }).strict(),
    z.object({ action: z.literal("complete"), enrollmentId: z.number().int().positive().safe(),
      teachingConfirmed: z.literal(true), tutorApprovalConfirmed: z.literal(true),
      questionsConfirmed: z.literal(true), evidence: z.string().trim().min(30).max(3000),
    }).strict(),
  ])).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    return db.transaction(async (tx: any) => {
      await tx.select().from(eliteScheduleLock).where(eq(eliteScheduleLock.id,1)).for("update");
      const [row] = await tx.select().from(enrollments).where(eq(enrollments.id, input.enrollmentId)).limit(1).for("update");
      if (!row || row.tier !== "elite" || row.yearLevel !== "year5-6" ||
          row.paymentStatus !== "paid" || !row.studentId || !row.courseId || !row.acceptedAt || !row.activatedAt)
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "An activated, paid Year 5/6 Elite enrolment is required." });
      // Serialize with exercise writes and make repeated submissions harmless.
      if (input.action === "complete" && row.status === "completed") return { status: "completed" };
      if (row.status !== "active")
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "This enrolment is not active." });
      if (input.action === "completion_access" && row.accessEndsAt === null) return { status: "active" };
      let content = "Elite access corrected to end on confirmed course completion. Previous recorded expiry: " +
        (row.accessEndsAt?.toISOString() ?? "none") + ". Accepted agreement retained unchanged.";
      const now = new Date();
      if (input.action === "complete") {
        const course: { id: number; title: string | null }[] = (await tx.select({ id: lessons.id, title: lessons.title }).from(lessons)
          .where(eq(lessons.courseId, row.courseId)))
          .filter((l: { title: string | null }) => l.title?.trim().toLowerCase() !== "access verification");
        if (course.length !== 23)
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "The 23-lesson course must be available before completion can be recorded." });
        const scores: { lessonId: number; difficulty: string }[] = await tx.selectDistinct({ lessonId: lessonAttempts.lessonId, difficulty: lessonAttempts.difficulty })
          .from(lessonAttempts).where(and(eq(lessonAttempts.enrollmentId,row.id),
            eq(lessonAttempts.studentId,row.studentId), eq(lessonAttempts.status,"submitted"),
            gte(lessonAttempts.validScore,8), inArray(lessonAttempts.lessonId,course.map(l => l.id))));
        if (!course.every(l => ["easy","medium","challenging"].every(level =>
          scores.some(s => s.lessonId === l.id && s.difficulty === level))))
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "All 23 lessons must have valid passes at all three difficulties." });
        const teaching: { id:number; sequence:number; status:string }[] = await tx.select({id:eliteTeachingSessions.id,sequence:eliteTeachingSessions.sequence,status:eliteTeachingSessions.status})
          .from(eliteTeachingSessions).where(eq(eliteTeachingSessions.enrollmentId,row.id));
        const reports: { sessionId:number }[] = teaching.length ? await tx.selectDistinct({sessionId:eliteSessionReports.sessionId}).from(eliteSessionReports)
          .where(inArray(eliteSessionReports.sessionId,teaching.map(s=>s.id))) : [];
        const replacements=await tx.select().from(eliteReplacements).where(eq(eliteReplacements.enrollmentId,row.id));
        if(!teachingComplete(teaching,replacements,reports.map(r=>r.sessionId)))
          throw new TRPCError({code:"PRECONDITION_FAILED",message:"All 46 teaching hours must be delivered and documented, including approved replacements for missed bookings."});
        content = "Elite course completion confirmed by Admin. Teaching requirements, tutor approval and five student-created questions per lesson confirmed. Evidence: " +
          input.evidence + ". Learning access closed. Optional internal discussions do not reopen learning access.";
      }
      await tx.insert(studentFileEntries).values({ enrollmentId: row.id, authorId: ctx.user.id,
        requestId: randomUUID(), kind: "note", entryDate: sydneyDate(now), minutes: 0, content });
      await tx.update(enrollments).set(input.action === "complete"
        ? { status: "completed", accessEndsAt: now }
        : { accessEndsAt: null }).where(eq(enrollments.id,row.id));
      return { status: input.action === "complete" ? "completed" : "active" };
    });
  }),
});
