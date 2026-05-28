import { router, publicProcedure } from "../_core/trpc.js";
import { z } from "zod";

export const teacherRouter = router({
  setAvailability: publicProcedure
    .input(z.object({ teacherId: z.number(), availability: z.array(z.object({ date: z.string(), slots: z.array(z.string()) })) }))
    .mutation(async ({ input }) => {
      console.log("Setting teacher availability:", input);
      return { success: true };
    }),
  // Add other teacher-related procedures as needed
});
