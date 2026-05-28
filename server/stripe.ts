/**
 * Stripe Payment Integration for SCHROOL Platform
 * 
 * Handles:
 * - One-time upfront payments
 * - Payment plans (deposit + 3 monthly installments)
 * - Webhook verification
 */

import Stripe from 'stripe';
import { ENV } from './_core/env';
import type { YearLevel, Tier, PaymentMethod } from '../shared/pricing';
import { calculateTotalCost, getPaymentBreakdown, getYearLevelName, getTierName } from '../shared/pricing';

if (!ENV.stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY environment variable is required');
}

export const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export interface CreateCheckoutSessionParams {
  yearLevel: YearLevel;
  tier: Tier;
  paymentMethod: PaymentMethod;
  studentName: string;
  studentEmail: string;
  studentAge: string; // Add student age
  parentName: string;
  parentEmail: string;
  phone: string; // Add parent phone
  userId: number;
  successUrl: string;
  cancelUrl: string;
  preferredDays?: string; // Comma-separated days for Elite tier
}

/**
 * Create Stripe Checkout Session for enrollment payment
 */
export async function createEnrollmentCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const {
    yearLevel,
    tier,
    paymentMethod,
    studentName,
    studentEmail,
    studentAge, // Extract student age
    parentName,
    parentEmail,
    phone, // Extract parent phone
    userId,
    successUrl,
    cancelUrl,
  } = params;

  const totalCost = calculateTotalCost(yearLevel, tier, paymentMethod);
  const breakdown = getPaymentBreakdown(yearLevel, tier, paymentMethod);
  const yearName = getYearLevelName(yearLevel);
  const tierName = getTierName(tier);

  // Metadata to store with the payment
  const metadata: Record<string, string> = {
    yearLevel,
    tier,
    paymentMethod,
    studentName,
    studentEmail,
    studentAge, // Add student age to metadata
    parentName,
    parentEmail,
    parentPhone: phone, // Add parent phone to metadata
    userId: userId.toString(),
    productType: 'enrollment',
  };

  // Add preferred days for Elite tier
  if (params.preferredDays) {
    metadata.preferred_days = params.preferredDays;
  }

  // Mocking Stripe for demo
  if (ENV.stripeSecretKey === 'sk_test_dummy_disabled') {
    console.log('[Stripe] MOCK MODE: Creating mock checkout session and enrollment');
    
    // Import dynamically to avoid circular dependency if any
    const { getDb } = await import('./db');
    const { enrollments } = await import('../drizzle/schema');
    
    const db = await getDb();
    const { users } = await import('../drizzle/schema');
    const { generateMagicLinkToken } = await import('./db');

    // Create student user
    const studentId = Math.floor(Math.random() * 10000);
    await db.insert(users).values({
      id: studentId,
      email: studentEmail,
      name: studentName,
      role: 'student',
      openId: `mock_student_${studentId}`,
    });

    // Create parent user
    const parentId = Math.floor(Math.random() * 10000);
    await db.insert(users).values({
      id: parentId,
      email: parentEmail,
      name: parentName,
      role: 'parent',
      openId: `mock_parent_${parentId}`,
    });

    const [result] = await db.insert(enrollments).values({
      courseId: 1, // Default for mock
      userId: studentId,
      studentName,
      studentAge: parseInt(studentAge),
      parentName,
      parentEmail,
      parentPhone: phone,
      tier: tier as any,
      paymentType: paymentMethod === 'upfront' ? 'upfront' : 'payment_plan',
      paymentAmount: '5584.00',
      status: 'active',
      paymentStatus: 'paid',
      termsAccepted: true,
    });
    
    const enrollmentId = result.insertId;
    const mockSessionId = `mock_session_${enrollmentId}`;

    // Generate magic links
    const studentToken = await generateMagicLinkToken(studentId, 'student');
    const parentToken = await generateMagicLinkToken(parentId, 'parent');

    console.log(`[MOCK] Enrollment Created: ${enrollmentId}`);
    console.log(`[MOCK] Student Magic Link: /auth/magic?token=${studentToken}`);
    console.log(`[MOCK] Parent Magic Link: /auth/magic?token=${parentToken}`);
    
    return {
      id: mockSessionId,
      url: successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId),
      metadata,
    } as any;
  }

  if (paymentMethod === 'upfront') {
    // One-time payment
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `${yearName} ${tierName} - Full Payment`,
              description: `Complete ${tierName} course for ${yearName} Mathematics`,
            },
            unit_amount: Math.round(totalCost * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: parentEmail,
      metadata,
      billing_address_collection: 'required',
    });

    return session;
  } else {
    // Payment plan: 30% deposit today + 4 monthly payments
    // Strategy: Charge deposit as one-time payment, then create subscription for 4 monthly payments
    
    // Create product and price for monthly payment
    const product = await stripe.products.create({
      name: `${yearName} ${tierName} - Monthly Payment`,
      description: `Monthly installment for ${tierName} course (4 payments total)`,
      metadata,
    });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'aud',
      unit_amount: Math.round(breakdown.monthlyPayment! * 100),
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
    });

    // Create checkout session with deposit + subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        // One-time deposit (30%)
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `${yearName} ${tierName} - 30% Deposit`,
              description: 'One-time deposit payment (due today)',
            },
            unit_amount: Math.round(breakdown.deposit! * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: parentEmail,
      metadata: {
        ...metadata,
        monthlyPriceId: monthlyPrice.id,
        installmentsRemaining: '4',
      },
      billing_address_collection: 'required',
      // After deposit payment, webhook will create subscription for 4 monthly payments
    });

    return session;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = ENV.stripeWebhookSecret;
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    throw new Error(`Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

/**
 * Handle successful payment
 * Returns enrollment data to be created
 */
export function extractEnrollmentDataFromPayment(
  session: Stripe.Checkout.Session
): {
  yearLevel: YearLevel;
  tier: Tier;
  paymentMethod: PaymentMethod;
  studentName: string;
  studentEmail: string;
  parentName: string;
  parentEmail: string;
  userId: number;
  stripeSessionId: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
} {
  const metadata = session.metadata!;

  return {
    yearLevel: metadata.yearLevel as YearLevel,
    tier: metadata.tier as Tier,
    paymentMethod: metadata.paymentMethod as PaymentMethod,
    studentName: metadata.studentName,
    studentEmail: metadata.studentEmail,
    parentName: metadata.parentName,
    parentEmail: metadata.parentEmail,
    userId: parseInt(metadata.userId),
    stripeSessionId: session.id,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : null,
    stripeSubscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
  };
}

/**
 * Cancel a subscription (for payment plan enrollments)
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(
  subscriptionId: string
): Promise<Stripe.Subscription.Status> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription.status;
}
