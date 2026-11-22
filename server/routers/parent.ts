import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc.js";
import { getDb } from "../db.js";
import { enrollments, parentStudentLinks, users } from "../../drizzle/schema.js";
import { parentEnrollment, parentProgress, parentReports, parentSchedule } from "../parentRecords.js";
const family=protectedProcedure.use(async({ctx,next})=>{
  ctx.res.setHeader("Cache-Control","no-store");
  if(ctx.user.role!=="parent" || ctx.user.accountStatus!=="active")throw new TRPCError({code:"FORBIDDEN",message:"Active parent account required."});
  const db=await getDb();if(!db)throw new TRPCError({code:"INTERNAL_SERVER_ERROR",message:"Family records unavailable."});
  return next({ctx:{...ctx,db}});
});
const record=family.input(z.object({enrollmentId:z.number().int().positive().safe()})).use(async({ctx,input,next})=>{
  const enrollment=await parentEnrollment(ctx.db,ctx.user.id,input.enrollmentId);
  return next({ctx:{...ctx,enrollment}});
});
export const parentRouter=router({
  enrollments:family.query(async({ctx})=>ctx.db.select({id:enrollments.id,studentName:enrollments.studentName,yearLevel:enrollments.yearLevel,tier:enrollments.tier,status:enrollments.status})
    .from(enrollments).innerJoin(parentStudentLinks,and(eq(parentStudentLinks.studentId,enrollments.studentId),eq(parentStudentLinks.parentId,ctx.user.id),eq(parentStudentLinks.status,"active"),isNotNull(parentStudentLinks.verifiedAt)))
    .innerJoin(users,and(eq(users.id,enrollments.studentId),eq(users.role,"student"),eq(users.accountStatus,"active")))
    .where(eq(enrollments.parentId,ctx.user.id)).orderBy(desc(enrollments.id))),
  overview:record.query(async({ctx})=>({enrollment:ctx.enrollment,progress:await parentProgress(ctx.db,ctx.enrollment)})),
  schedule:record.query(({ctx})=>parentSchedule(ctx.db,ctx.enrollment)),
  reports:record.input(z.object({page:z.number().int().min(0).max(100000).default(0)})).query(({ctx,input})=>parentReports(ctx.db,ctx.enrollment.id,input.page)),
});
