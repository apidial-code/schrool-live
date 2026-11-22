import { z } from "zod";

export const photoLimit = 360000;
export const questionWork = z.object({
  question: z.string().trim().max(2000),
  answer: z.string().trim().max(4000),
  photo: z.string().max(photoLimit).nullable(),
}).strict();
export const draftWork = z.array(questionWork).length(5);
export const submittedWork = draftWork.refine(rows => rows.every(row =>
  row.photo !== null || row.question.length >= 3 && row.answer.length >= 3),
  "Include each question and its worked answer, typed or in a clear photo.");
export type QuestionWork = z.infer<typeof questionWork>;
export function emptyWork(): QuestionWork[] {
  return Array.from({ length: 5 }, () => ({ question: "", answer: "", photo: null }));
}
export function approvedLessons(reviews: { lessonId: number; decision: string }[]) {
  return new Set(reviews.filter(r => r.decision === "approved").map(r => r.lessonId));
}
