import { router, publicProcedure } from "../_core/trpc.js";
import { z } from "zod";

export const lessonsRouter = router({
  list: publicProcedure
    .query(() => {
      return [];
    }),
  getById: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(({ input }) => {
      return null;
    }),
  getExercises: publicProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(({ input }) => {
      return [];
    }),
});
