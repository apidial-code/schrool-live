import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import { z } from "zod";
import { enrollments, studentFileEntries, users } from "../../drizzle/schema.js";
import { adminProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { getSignInOrigin } from "../_core/signInEmail.js";
import { sydneyDate, supportWindow, validDate } from "../../shared/standardSupport.js";
const date = z.string().refine(validDate, "Enter a valid date.");
const input = z.object({ enrollmentId: z.number().int().positive().safe() });
const procedure = adminProcedure.use(async ({ ctx, next }) => {
  ctx.res.setHeader("Cache-Control", "no-store");
  if (ctx.user.accountStatus !== "active") throw new TRPCError({ code: "FORBIDDEN", message: "Active Admin account required." });
  const db = await getDb();
  return next({ ctx: { ...ctx, db } });
});
async function usedMinutes(db: any, enrollmentId: number, start: string, end: string) {
  const [row] = await db.select({ minutes: sql<number>`COALESCE(SUM(${studentFileEntries.minutes}), 0)` }).from(studentFileEntries).where(and(
    eq(studentFileEntries.enrollmentId, enrollmentId), eq(studentFileEntries.kind, "call"),
    gte(studentFileEntries.entryDate, start), lt(studentFileEntries.entryDate, end)));
  return Number(row.minutes);
}
export const studentSupportRouter = router({
  history: procedure.input(input.extend({ date, page: z.number().int().min(0).max(100000).default(0) })).query(async ({ ctx, input }) => {
    const [record] = await ctx.db.select().from(enrollments).where(eq(enrollments.id,input.enrollmentId)).limit(1);
    if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Enrolment unavailable." });
    const today = sydneyDate(new Date());
    const window = record.tier === "standard" ? supportWindow(record.activatedAt,input.date,today) : null;
    const used = window?.weekStart && window.weekEnd ? await usedMinutes(ctx.db,record.id,window.weekStart,window.weekEnd) : 0;
    const entries = await ctx.db.select({ id: studentFileEntries.id, kind: studentFileEntries.kind,
      entryDate: studentFileEntries.entryDate, minutes: studentFileEntries.minutes, content: studentFileEntries.content,
      createdAt: studentFileEntries.createdAt, authorId: studentFileEntries.authorId, authorName: users.name,
    }).from(studentFileEntries).leftJoin(users,eq(users.id,studentFileEntries.authorId))
      .where(eq(studentFileEntries.enrollmentId,record.id)).orderBy(desc(studentFileEntries.id)).limit(26).offset(input.page*25);
    return { window, used, remaining: Math.max(0,30-used), today,
      canRecordCall: !!window?.eligible && record.status === "active" && record.paymentStatus === "paid" && used < 30,
      entries: entries.slice(0,25), hasMore: entries.length>25 };
  }),
  record: procedure.input(input.extend({ requestId: z.string().uuid(), kind: z.enum(["note","call"]), date,
    minutes: z.number().int().min(0).max(30), content: z.string().trim().min(1).max(4000),
  }).strict().superRefine((v,ctx) => { if ((v.kind === "call" && v.minutes < 1) || (v.kind === "note" && v.minutes !== 0)) ctx.addIssue({ code: "custom", message: "Calls require 1 to 30 minutes; notes require zero minutes." }); }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.req.headers.origin !== getSignInOrigin()) throw new TRPCError({ code:"FORBIDDEN",message:"Invalid request origin." });
      return ctx.db.transaction(async (tx: any) => {
        // All writes for one enrolment share this lock: concurrent calls cannot exceed the weekly allowance.
        const [record] = await tx.select().from(enrollments).where(eq(enrollments.id,input.enrollmentId)).limit(1).for("update");
        if (!record) throw new TRPCError({ code:"NOT_FOUND",message:"Enrolment unavailable." });
        const [existing] = await tx.select().from(studentFileEntries).where(eq(studentFileEntries.requestId,input.requestId)).limit(1);
        if (existing) {
          if (existing.enrollmentId !== input.enrollmentId || existing.authorId !== ctx.user.id || existing.kind !== input.kind || existing.entryDate !== input.date || existing.minutes !== input.minutes || existing.content !== input.content) throw new TRPCError({ code:"CONFLICT",message:"Save reference already used. Refresh the file before trying again." });
          return { saved: true };
        }
        const today = sydneyDate(new Date());
        if (input.date > today) throw new TRPCError({ code:"BAD_REQUEST",message:"Future entries cannot be recorded." });
        if (input.kind === "call") {
          const window = record.tier === "standard" ? supportWindow(record.activatedAt,input.date,today) : null;
          if (record.status !== "active" || record.paymentStatus !== "paid" || !window?.eligible || !window.weekStart || !window.weekEnd) throw new TRPCError({ code:"BAD_REQUEST",message:"Select a call date within this Standard enrolment's first three months." });
          const used = await usedMinutes(tx,record.id,window.weekStart,window.weekEnd);
          if (used+input.minutes > 30) throw new TRPCError({ code:"CONFLICT",message:`Only ${Math.max(0,30-used)} minutes remain for that support week.` });
        }
        await tx.insert(studentFileEntries).values({ enrollmentId: record.id, authorId: ctx.user.id,
          requestId: input.requestId, kind: input.kind, entryDate: input.date, minutes: input.minutes, content: input.content });
        return { saved: true };
      });
    }),
});
