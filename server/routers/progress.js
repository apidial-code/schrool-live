import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
export const progressRouter = router({
    getUserProgress: publicProcedure
        .query(async () => {
        return []; // Return empty progress for demo
    }),
    getLessonProgress: publicProcedure
        .input(z.object({ lessonId: z.number() }))
        .query(async ({ input }) => {
        return {
            completed: false,
            score: 0,
            lastAttempt: new Date(),
        };
    }),
    updateLessonProgress: publicProcedure
        .input(z.object({
        lessonId: z.number(),
        score: z.number(),
        completed: z.boolean(),
    }))
        .mutation(async ({ input }) => {
        return { success: true };
    }),
});
