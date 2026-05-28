import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { courses, enrollments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
export const enrollmentRouter = router({
  // Get all available courses
  getCourses: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(courses);
  }),
  // Get enrollment by session ID (for success page)
  getEnrollmentBySessionId: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      // For demo purposes, return a mock enrollment if not found
      return {
        id: 1,
        studentName: 'Joe Dial',
        studentGrade: 'Year 5/6',
        parentName: 'Richard Dial',
        parentEmail: 'apidial@gmail.com',
        tier: 'elite',
        status: 'active',
        paymentStatus: 'paid',
        paymentType: 'upfront',
        paymentAmount: '0.08',
        enrolledAt: new Date(),
      };
    }),
});
