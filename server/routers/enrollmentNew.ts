/**
 * New Enrollment Router with Stripe Integration
 * 
 * Handles unified enrollment form with:
 * - All year levels (5/6, 7, 8, 9)
 * - Standard and Elite tiers
 * - Upfront and Payment Plan options
 * - Stripe checkout session creation
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { createEnrollmentCheckoutSession } from "../stripe";
import { getDb } from "../db";
import { enrollments } from "../../drizzle/schema";
import type { YearLevel, Tier, PaymentMethod } from "../../shared/pricing";

export const enrollmentNewRouter = router({
  /**
   * Create Stripe Checkout Session for enrollment
   * Public endpoint - no authentication required for initial enrollment
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        yearLevel: z.enum(['year5-6', 'year7', 'year8', 'year9']),
        tier: z.enum(['standard', 'elite']),
        paymentMethod: z.enum(['upfront', 'payment-plan']),
        studentName: z.string().min(1),
        studentEmail: z.string().email(),
        studentAge: z.string().min(1), // Add student age
        parentName: z.string().min(1),
        parentEmail: z.string().email(),
        phone: z.string().min(1),
        preferredDays: z.string().optional(), // Comma-separated days for Elite tier
      })
    )
    .mutation(async ({ input }) => {
      const { yearLevel, tier, paymentMethod, studentName, studentEmail, studentAge, parentName, parentEmail, phone, preferredDays } = input;

      // Create success and cancel URLs
      // Use the actual deployment URL from environment or fallback to localhost for local dev
      const baseUrl = process.env.VITE_APP_URL || 'https://www.schrool.com';
      
      const successUrl = `${baseUrl}/enrollment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${baseUrl}/enroll-new`;

      try {
        // Create Stripe checkout session
        const session = await createEnrollmentCheckoutSession({
          yearLevel: yearLevel as YearLevel,
          tier: tier as Tier,
          paymentMethod: paymentMethod as PaymentMethod,
          studentName,
          studentEmail,
          studentAge, // Add student age
          parentName,
          parentEmail,
          phone, // Add parent phone
          userId: 0, // Will be created after successful payment
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

  /**
   * Handle successful payment webhook
   * Called by Stripe after successful payment
   */
  handlePaymentSuccess: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        yearLevel: z.enum(['year5-6', 'year7', 'year8', 'year9']),
        tier: z.enum(['standard', 'elite']),
        paymentMethod: z.enum(['upfront', 'payment-plan']),
        studentName: z.string(),
        studentEmail: z.string(),
        parentName: z.string(),
        parentEmail: z.string(),
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Create user account for student/parent
      // TODO: Create enrollment record
      // TODO: Assign teacher for Elite tier
      // TODO: Send confirmation emails

      return {
        success: true,
        message: 'Enrollment created successfully',
      };
    }),

  /**
   * Get enrollment by session ID (for success page)
   */
  getEnrollmentBySession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // TODO: Query enrollment by Stripe session ID
      // For now, return mock data

      return {
        enrollmentId: 1,
        studentName: 'John Doe',
        yearLevel: 'year5-6',
        tier: 'elite',
        status: 'active',
      };
    }),
});
