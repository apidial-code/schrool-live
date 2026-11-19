import { studentSupportRouter } from "./studentSupport.js";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, inArray, like, or, sql, lte, gt } from "drizzle-orm";
import { router, adminProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { enrollments, enrollmentPayments, lessons, lessonAttempts, users } from "../../drizzle/schema.js";
import { enrollmentSnapshotSchema } from "../enrollmentAgreement.js";
import { lessonScores, courseLevels } from "../../shared/courseProgress.js";

const records = adminProcedure.use(async ({ ctx, next }) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  if (ctx.user.accountStatus !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Active Admin account required." });
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Student records unavailable." });
  return next({ ctx: { ...ctx, db } });
});
export const adminRouter = router({
  support: studentSupportRouter,
  getDashboardStats: records.query(async ({ ctx }) => {
    const now = new Date();
    const [accounts] = await ctx.db.select({
      totalUsers: sql<number>`COUNT(*)`,
      activeTeachers: sql<number>`COALESCE(SUM(CASE WHEN ${users.role} = 'teacher' AND ${users.accountStatus} = 'active' THEN 1 ELSE 0 END),0)`,
      pendingTeachers: sql<number>`COALESCE(SUM(CASE WHEN ${users.role} = 'teacher' AND ${users.accountStatus} = 'pending' THEN 1 ELSE 0 END),0)`,
    }).from(users);
    const [enrolments] = await ctx.db.select({ totalEnrollments: sql<number>`COUNT(*)`,
      draftEnrollments: sql<number>`COALESCE(SUM(CASE WHEN ${enrollments.status} = 'draft' THEN 1 ELSE 0 END),0)`,
    }).from(enrollments);
    // Count students once even when they hold multiple active enrolments.
    const [active] = await ctx.db.select({ activeStudents: sql<number>`COUNT(DISTINCT ${enrollments.studentId})`,
      standardEnrollments: sql<number>`COALESCE(SUM(CASE WHEN ${enrollments.tier} = 'standard' THEN 1 ELSE 0 END),0)`,
      eliteEnrollments: sql<number>`COALESCE(SUM(CASE WHEN ${enrollments.tier} = 'elite' THEN 1 ELSE 0 END),0)`,
    }).from(enrollments).innerJoin(users,eq(users.id,enrollments.studentId)).where(and(
      eq(enrollments.status,"active"), eq(enrollments.paymentStatus,"paid"),
      eq(users.role,"student"), eq(users.accountStatus,"active"),
      lte(enrollments.acceptedAt,now), lte(enrollments.activatedAt,now), gt(enrollments.accessEndsAt,now),
    ));
    return { totalUsers: Number(accounts.totalUsers), activeTeachers: Number(accounts.activeTeachers),
      pendingTeachers: Number(accounts.pendingTeachers), totalEnrollments: Number(enrolments.totalEnrollments),
      draftEnrollments: Number(enrolments.draftEnrollments), activeStudents: Number(active.activeStudents),
      standardEnrollments: Number(active.standardEnrollments), eliteEnrollments: Number(active.eliteEnrollments), checkedAt: now };
  }),
  getRecentActivity: records.input(z.object({limit:z.number().int().min(1).max(20).default(10)}))
    .query(async ({ctx,input}) => {
      const rows: { id: number; studentName: string | null; yearLevel: string | null; tier: string | null; status: string; paymentStatus: string; activatedAt: Date | null }[] = await ctx.db.select({id:enrollments.id, studentName:enrollments.studentName,
      yearLevel:enrollments.yearLevel, tier:enrollments.tier, status:enrollments.status,
      paymentStatus:enrollments.paymentStatus, activatedAt:enrollments.activatedAt,
    }).from(enrollments).where(lte(enrollments.activatedAt,new Date()))
      .orderBy(desc(enrollments.activatedAt),desc(enrollments.id)).limit(input.limit);
      return rows;
    }),
  studentFiles: records.input(z.object({ search: z.string().trim().max(100).default(""), page: z.number().int().min(0).max(100000).default(0) }))
    .query(async ({ ctx, input }) => {
      const search = input.search.replace(/[\\%_]/g, "\\$&");
      const rows = await ctx.db.select({ id: enrollments.id, studentName: enrollments.studentName,
        yearLevel: enrollments.yearLevel, tier: enrollments.tier, status: enrollments.status,
        paymentStatus: enrollments.paymentStatus, enrolledAt: enrollments.enrolledAt,
      }).from(enrollments).where(search ? or(like(enrollments.studentName, `%${search}%`),
        like(enrollments.parentEmail, `%${search}%`), eq(enrollments.id, Number(input.search) || 0)) : undefined)
        .orderBy(desc(enrollments.id)).limit(26).offset(input.page * 25);
      return { rows: rows.slice(0, 25), hasMore: rows.length > 25 };
    }),
  studentFile: records.input(z.object({ enrollmentId: z.number().int().positive().safe() }))
    .query(async ({ ctx, input }) => {
      const [record] = await ctx.db.select({ id: enrollments.id, studentId: enrollments.studentId,
        studentName: enrollments.studentName, parentEmail: enrollments.parentEmail,
        consultantId: enrollments.consultantId, courseId: enrollments.courseId,
        yearLevel: enrollments.yearLevel, tier: enrollments.tier, status: enrollments.status,
        paymentStatus: enrollments.paymentStatus, agreedTotalCents: enrollments.agreedTotalCents,
        currency: enrollments.currency, paymentPlan: enrollments.paymentPlan,
        enrolledAt: enrollments.enrolledAt, acceptedAt: enrollments.acceptedAt,
        activatedAt: enrollments.activatedAt, accessEndsAt: enrollments.accessEndsAt,
        agreementSnapshot: enrollments.agreementSnapshot,
      }).from(enrollments).where(eq(enrollments.id, input.enrollmentId)).limit(1);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Student file not found." });
      let snapshot: z.infer<typeof enrollmentSnapshotSchema> | null = null;
      try { snapshot = enrollmentSnapshotSchema.parse(JSON.parse(record.agreementSnapshot || "")); } catch { /* Legacy file: show recorded fields only. */ }
      const course: { id: number; title: string | null }[] = record.courseId ? await ctx.db.select({ id: lessons.id, title: lessons.title })
        .from(lessons).where(eq(lessons.courseId, record.courseId)).orderBy(asc(lessons.orderIndex), asc(lessons.id)) : [];
      const visible = course.filter(l => record.yearLevel !== "year5-6" || l.title?.trim().toLowerCase() !== "access verification");
      const scores: { lessonId: number; difficulty: string; best: number | null; submitted: number; active: number; lastActivity: Date | null }[] = record.studentId && visible.length ? await ctx.db.select({
        lessonId: lessonAttempts.lessonId, difficulty: lessonAttempts.difficulty,
        best: sql<number | null>`MAX(CASE WHEN ${lessonAttempts.status} = 'submitted' THEN ${lessonAttempts.validScore} ELSE NULL END)`,
        submitted: sql<number>`SUM(CASE WHEN ${lessonAttempts.status} = 'submitted' THEN 1 ELSE 0 END)`,
        active: sql<number>`SUM(CASE WHEN ${lessonAttempts.status} = 'in_progress' THEN 1 ELSE 0 END)`,
        lastActivity: sql<Date | null>`MAX(${lessonAttempts.updatedAt})`,
      }).from(lessonAttempts).where(and(eq(lessonAttempts.studentId, record.studentId),
        eq(lessonAttempts.enrollmentId, record.id), inArray(lessonAttempts.lessonId, visible.map(l => l.id))))
        .groupBy(lessonAttempts.lessonId, lessonAttempts.difficulty) : [];
      const progress = visible.map(l => {
        const levels = lessonScores(scores.filter(s => s.lessonId === l.id));
        return { ...l, levels, completed: courseLevels.every(level => (levels[level].bestScore ?? -1) >= 8) };
      });
      const payments = await ctx.db.select({ id: enrollmentPayments.id, amountCents: enrollmentPayments.amountCents,
        currency: enrollmentPayments.currency, status: enrollmentPayments.status, livemode: enrollmentPayments.livemode,
        paidAt: enrollmentPayments.paidAt, createdAt: enrollmentPayments.createdAt,
      }).from(enrollmentPayments).where(eq(enrollmentPayments.enrollmentId, record.id)).orderBy(desc(enrollmentPayments.id));
      const { agreementSnapshot, ...enrollment } = record;
      return { enrollment, draftSavedAt: snapshot?.savedAt ?? null, family: snapshot?.family ?? null, courseName: snapshot?.quote.courseName ?? null,
        schedule: snapshot?.quote.schedule ?? [], snapshotAvailable: !!snapshot, progress, payments,
        lastActivity: scores.map(s => s.lastActivity).filter(Boolean).map(d => new Date(d!).getTime()).filter(Number.isFinite).sort((a,b) => b-a)[0] ?? null };
    }),
});
