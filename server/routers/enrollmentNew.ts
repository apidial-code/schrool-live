import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc.js";
import { createEnrollmentCheckoutSession } from "../stripe.js";
import { getDb } from "../db.js";

export const enrollmentNewRouter = router({
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        yearLevel: z.enum(['year5-6', 'year7', 'year8', 'year9']),
        tier: z.enum(['standard', 'elite']),
        paymentMethod: z.enum(['upfront', 'payment-plan']),
        studentName: z.string().min(1),
        studentEmail: z.string().email(),
        studentAge: z.string().min(1),
        parentName: z.string().min(1),
        parentEmail: z.string().email(),
        phone: z.string().min(1),
        preferredDays: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { yearLevel, tier, paymentMethod, studentName, studentEmail, studentAge, parentName, parentEmail, phone, preferredDays } = input;
      const baseUrl = process.env.VITE_APP_URL || 'https://www.schrool.com';
      const successUrl = `${baseUrl}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/enroll/elite`;
      try {
        const session = await createEnrollmentCheckoutSession({
          yearLevel: yearLevel as any,
          tier: tier as any,
          paymentMethod: paymentMethod as any,
          studentName,
          studentEmail,
          studentAge,
          parentName,
          parentEmail,
          phone,
          userId: 0,
          successUrl,
          cancelUrl,
          preferredDays,
        });
        return {
          url: session.url!,
          sessionId: session.id,
        };
      } catch (error) {
        console.error('Stripe checkout session creation failed:', error);
        throw new Error('Failed to create payment session. Please try again.');
      }
    }),
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
