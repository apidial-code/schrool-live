import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";

interface LessonProgress {
  easyCompleted: number;
  mediumCompleted: number;
  challengingCompleted: number;
  score: number;
  lastAttempt: Date;
}

const mockProgress: Record<number, LessonProgress> = {};

export const progressRouter = router({
  getUserProgress: publicProcedure
    .query(async () => {
      // For simplicity, return an array of all lesson progress entries
      // In a real app, this would be filtered by user
      return Object.entries(mockProgress).map(([lessonId, progress]) => ({
        lessonId: parseInt(lessonId),
        ...progress,
        completed: progress.easyCompleted > 0 && progress.mediumCompleted > 0 && progress.challengingCompleted > 0,
        correctAnswers: progress.score, // Assuming score represents correct answers
      }));
    }),
  getLessonProgress: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      return mockProgress[input.lessonId] || {
        easyCompleted: 0,
        mediumCompleted: 0,
        challengingCompleted: 0,
        score: 0,
        lastAttempt: new Date(0),
      };
    }),
  updateLessonProgress: publicProcedure
    .input(z.object({
      lessonId: z.number(),
      score: z.number(),
      difficulty: z.enum(["easy", "medium", "challenging"]),
    }))
    .mutation(async ({ input }) => {
      const currentProgress = mockProgress[input.lessonId] || {
        easyCompleted: 0,
        mediumCompleted: 0,
        challengingCompleted: 0,
        score: 0,
        lastAttempt: new Date(0),
      };

      currentProgress.score = input.score;
      currentProgress.lastAttempt = new Date();

      if (input.difficulty === "easy") {
        currentProgress.easyCompleted = 1;
      } else if (input.difficulty === "medium") {
        currentProgress.mediumCompleted = 1;
      } else if (input.difficulty === "challenging") {
        currentProgress.challengingCompleted = 1;
      }

      mockProgress[input.lessonId] = currentProgress;

      return { success: true, passed: input.score >= 8, score: input.score };
    }),
});
