import { TRPCError } from "@trpc/server";
import { and, asc, desc, eq, isNotNull, inArray, sql } from "drizzle-orm";
import { enrollments, users, parentStudentLinks, lessons, lessonAttempts, eliteAllocations, eliteTeachingSessions, eliteSessionReports } from "../drizzle/schema.js";
import { courseLevels, lessonScores } from "../shared/courseProgress.js";

export async function parentEnrollment(db:any,parentId:number,enrollmentId:number) {
  const [row]=await db.select({id:enrollments.id,studentId:enrollments.studentId,studentName:enrollments.studentName,
    courseId:enrollments.courseId,yearLevel:enrollments.yearLevel,tier:enrollments.tier,status:enrollments.status,
    paymentStatus:enrollments.paymentStatus,activatedAt:enrollments.activatedAt,accessEndsAt:enrollments.accessEndsAt})
    .from(enrollments).innerJoin(parentStudentLinks,and(eq(parentStudentLinks.studentId,enrollments.studentId),eq(parentStudentLinks.parentId,parentId),eq(parentStudentLinks.status,"active"),isNotNull(parentStudentLinks.verifiedAt)))
    .innerJoin(users,and(eq(users.id,enrollments.studentId),eq(users.role,"student"),eq(users.accountStatus,"active")))
    .where(and(eq(enrollments.id,enrollmentId),eq(enrollments.parentId,parentId))).limit(1);
  if(!row)throw new TRPCError({code:"NOT_FOUND",message:"Family record unavailable."});
  return row;
}
export async function parentProgress(db:any,row:any) {
  const course:{id:number;title:string|null}[]=row.courseId?await db.select({id:lessons.id,title:lessons.title}).from(lessons)
    .where(eq(lessons.courseId,row.courseId)).orderBy(asc(lessons.orderIndex),asc(lessons.id)):[];
  const visible=course.filter(l=>row.yearLevel!=="year5-6" || l.title?.trim().toLowerCase()!=="access verification");
  const scores:any[]=visible.length?await db.select({lessonId:lessonAttempts.lessonId,difficulty:lessonAttempts.difficulty,
    best:sql<number|null>`MAX(CASE WHEN ${lessonAttempts.status}='submitted' THEN ${lessonAttempts.validScore} ELSE NULL END)`,
    submitted:sql<number>`SUM(CASE WHEN ${lessonAttempts.status}='submitted' THEN 1 ELSE 0 END)`,
    active:sql<number>`SUM(CASE WHEN ${lessonAttempts.status}='in_progress' THEN 1 ELSE 0 END)`})
    .from(lessonAttempts).where(and(eq(lessonAttempts.studentId,row.studentId),eq(lessonAttempts.enrollmentId,row.id),inArray(lessonAttempts.lessonId,visible.map(l=>l.id))))
    .groupBy(lessonAttempts.lessonId,lessonAttempts.difficulty):[];
  return visible.map(l=>{const levels=lessonScores(scores.filter(s=>s.lessonId===l.id));return {...l,levels,completed:courseLevels.every(level=>(levels[level].bestScore??-1)>=8)};});
}
export async function parentSchedule(db:any,row:any) {
  if(row.tier!=="elite")return {timezone:"Australia/Sydney",tutor:null,sessions:[]};
  const [allocation]=await db.select({timezone:eliteAllocations.timezone,tutor:users.name}).from(eliteAllocations)
    .innerJoin(users,eq(users.id,eliteAllocations.teacherId)).where(eq(eliteAllocations.enrollmentId,row.id)).limit(1);
  const sessions=await db.select({id:eliteTeachingSessions.id,sequence:eliteTeachingSessions.sequence,startsAt:eliteTeachingSessions.startsAt,
    endsAt:eliteTeachingSessions.endsAt,status:eliteTeachingSessions.status,lessonTitle:lessons.title,tutor:users.name})
    .from(eliteTeachingSessions).leftJoin(lessons,eq(lessons.id,eliteTeachingSessions.lessonId)).leftJoin(users,eq(users.id,eliteTeachingSessions.teacherId))
    .where(eq(eliteTeachingSessions.enrollmentId,row.id)).orderBy(asc(eliteTeachingSessions.startsAt),asc(eliteTeachingSessions.id));
  return {timezone:allocation?.timezone??"Australia/Sydney",tutor:allocation?.tutor??null,sessions};
}
export async function parentReports(db:any,enrollmentId:number,page:number) {
  const rows=await db.select({id:eliteSessionReports.id,sessionId:eliteSessionReports.sessionId,sequence:eliteTeachingSessions.sequence,
    author:users.name,createdAt:eliteSessionReports.createdAt,revisionOf:eliteSessionReports.revisionOf,
    lessonUnderstanding:eliteSessionReports.lessonUnderstanding,nextObjectives:eliteSessionReports.nextObjectives,
    progressDifficulties:eliteSessionReports.progressDifficulties,assignedWork:eliteSessionReports.assignedWork,tutorComments:eliteSessionReports.tutorComments})
    .from(eliteSessionReports).innerJoin(eliteTeachingSessions,eq(eliteTeachingSessions.id,eliteSessionReports.sessionId))
    .leftJoin(users,eq(users.id,eliteSessionReports.authorId)).where(eq(eliteTeachingSessions.enrollmentId,enrollmentId))
    .orderBy(desc(eliteSessionReports.id)).limit(26).offset(page*25);
  return {rows:rows.slice(0,25),hasMore:rows.length>25};
}
