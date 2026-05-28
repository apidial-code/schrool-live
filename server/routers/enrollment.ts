import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { getDb } from "../db.js";

export const enrollmentRouter = router({
  getEnrollmentBySession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return {
        enrollmentId: 1,
        studentName: 'John Doe',
        yearLevel: 'year5-6',
        tier: 'elite',
        status: 'active',
      };
    }),
});
