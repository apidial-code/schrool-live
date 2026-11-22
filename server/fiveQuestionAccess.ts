import { TRPCError } from "@trpc/server";
import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { lessons, lessonAttempts, fiveQuestionReviews, fiveQuestionSubmissions, eliteTeachingSessions, eliteSessionReports, eliteSessionCovers } from "../drizzle/schema.js";
import { approvedLessons } from "../shared/fiveQuestions.js";

export async function fiveCourse(db:any, enrollmentId:number, courseId:number, studentId:number) {
  const course:{id:number;title:string|null}[] = await db.select({id:lessons.id,title:lessons.title})
    .from(lessons).where(eq(lessons.courseId,courseId)).orderBy(asc(lessons.orderIndex),asc(lessons.id));
  const rows = course.filter(l=>l.title?.trim().toLowerCase()!=="access verification");
  const reviews = await db.select({lessonId:fiveQuestionReviews.lessonId,decision:fiveQuestionReviews.decision})
    .from(fiveQuestionReviews).innerJoin(fiveQuestionSubmissions,and(eq(fiveQuestionSubmissions.id,fiveQuestionReviews.submissionId),eq(fiveQuestionSubmissions.studentId,studentId)))
    .where(eq(fiveQuestionReviews.enrollmentId,enrollmentId));
  return {course:rows,approved:approvedLessons(reviews)};
}
export async function requireFiveLesson(db:any, row:any, lessonId:number) {
  const {course,approved}=await fiveCourse(db,row.id,row.courseId,row.studentId);
  const index=course.findIndex(l=>l.id===lessonId);
  if(index<0)throw new TRPCError({code:"NOT_FOUND",message:"Lesson unavailable."});
  if(!course.slice(0,index).every(l=>approved.has(l.id)))
    throw new TRPCError({code:"FORBIDDEN",message:"Your regular tutor must approve the earlier lessons first."});
  return course[index];
}
export async function approvalRequirements(db:any,row:any,lessonId:number) {
  const scores:{difficulty:string}[]=await db.selectDistinct({difficulty:lessonAttempts.difficulty}).from(lessonAttempts)
    .where(and(eq(lessonAttempts.enrollmentId,row.id),eq(lessonAttempts.studentId,row.studentId),eq(lessonAttempts.lessonId,lessonId),
      eq(lessonAttempts.status,"submitted"),gte(lessonAttempts.validScore,8)));
  const exercises=["easy","medium","challenging"].every(d=>scores.some(s=>s.difficulty===d));
  const sessions:{id:number;startsAt:Date;endsAt:Date}[]=await db.select({id:eliteTeachingSessions.id,startsAt:eliteTeachingSessions.startsAt,endsAt:eliteTeachingSessions.endsAt})
    .from(eliteTeachingSessions).where(and(eq(eliteTeachingSessions.enrollmentId,row.id),eq(eliteTeachingSessions.studentId,row.studentId),
      eq(eliteTeachingSessions.lessonId,lessonId),eq(eliteTeachingSessions.status,"delivered")));
  const reports:{sessionId:number}[]=sessions.length?await db.selectDistinct({sessionId:eliteSessionReports.sessionId})
    .from(eliteSessionReports).where(inArray(eliteSessionReports.sessionId,sessions.map(s=>s.id))):[];
  const teaching=sessions.filter(s=>+s.endsAt<=Date.now()&&+s.endsAt-+s.startsAt===3600000&&reports.some(r=>r.sessionId===s.id)).length>=2;
  const covers:{status:string}[]=await db.select({status:eliteSessionCovers.status}).from(eliteSessionCovers)
    .innerJoin(eliteTeachingSessions,eq(eliteTeachingSessions.id,eliteSessionCovers.sessionId))
    .where(and(eq(eliteSessionCovers.enrollmentId,row.id),eq(eliteTeachingSessions.lessonId,lessonId),lte(eliteTeachingSessions.endsAt,new Date())));
  const returns=covers.every(c=>["cancelled","returned"].includes(c.status));
  return {exercises,teaching,returns};
}
