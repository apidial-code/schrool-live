import { ENV } from './_core/env.js';
import { calculateTotalCost, getPaymentBreakdown, getYearLevelName, getTierName } from '../shared/pricing.js';
let stripe = null;
async function getStripe() {
    if (stripe)
        return stripe;
    if (ENV.stripeSecretKey && ENV.stripeSecretKey !== 'sk_test_dummy_disabled') {
        const { default: Stripe } = await import('stripe');
        stripe = new Stripe(ENV.stripeSecretKey, {
            apiVersion: '2025-12-15.clover',
        });
        return stripe;
    }
    return null;
}
export async function createEnrollmentCheckoutSession(params) {
    const { yearLevel, tier, paymentMethod, studentName, studentEmail, studentAge, parentName, parentEmail, phone, userId, successUrl, cancelUrl, } = params;
    const totalCost = calculateTotalCost(yearLevel, tier, paymentMethod);
    const breakdown = getPaymentBreakdown(yearLevel, tier, paymentMethod);
    const yearName = getYearLevelName(yearLevel);
    const tierName = getTierName(tier);
    const metadata = {
        yearLevel,
        tier,
        paymentMethod,
        studentName,
        studentEmail,
        studentAge,
        parentName,
        parentEmail,
        parentPhone: phone,
        userId: userId.toString(),
        productType: 'enrollment',
    };
    if (params.preferredDays) {
        metadata.preferred_days = params.preferredDays;
    }
    if (!ENV.stripeSecretKey || ENV.stripeSecretKey === 'sk_test_dummy_disabled') {
        console.log('[Stripe] MOCK MODE: Creating mock checkout session and enrollment');
        const { getDb, generateMagicLinkToken } = await import('./db');
        const { users, enrollments } = await import('../drizzle/schema');
        const db = await getDb();
        const studentId = Math.floor(Math.random() * 10000);
        await db.insert(users).values({
            id: studentId,
            email: studentEmail,
            name: studentName,
            role: 'student',
            openId: `mock_student_${studentId}`,
        });
        const parentId = Math.floor(Math.random() * 10000);
        await db.insert(users).values({
            id: parentId,
            email: parentEmail,
            name: parentName,
            role: 'parent',
            openId: `mock_parent_${parentId}`,
        });
        const [result] = await db.insert(enrollments).values({
            courseId: 1,
            userId: studentId,
            studentName,
            studentAge: parseInt(studentAge),
            parentName,
            parentEmail,
            parentPhone: phone,
            tier: tier,
            paymentType: paymentMethod === 'upfront' ? 'upfront' : 'payment_plan',
            paymentAmount: totalCost.toString(),
            status: 'active',
            paymentStatus: 'paid',
            termsAccepted: true,
        });
        const enrollmentId = result.insertId;
        const mockSessionId = `mock_session_${enrollmentId}`;
        const studentToken = await generateMagicLinkToken(studentId, 'student');
        const parentToken = await generateMagicLinkToken(parentId, 'parent');
        return {
            id: mockSessionId,
            url: successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId),
            metadata,
        };
    }
    const stripeInstance = await getStripe();
    if (paymentMethod === 'upfront') {
        return await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: `${yearName} ${tierName} - Full Payment`,
                            description: `Complete ${tierName} course for ${yearName} Mathematics`,
                        },
                        unit_amount: Math.round(totalCost * 100),
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
    }
    else {
        const product = await stripeInstance.products.create({
            name: `${yearName} ${tierName} - Monthly Payment`,
            description: `Monthly installment for ${tierName} course (4 payments total)`,
            metadata,
        });
        const monthlyPrice = await stripeInstance.prices.create({
            product: product.id,
            currency: 'aud',
            unit_amount: Math.round(breakdown.monthlyPayment * 100),
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
        });
        return await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: `${yearName} ${tierName} - 30% Deposit`,
                            description: 'One-time deposit payment (due today)',
                        },
                        unit_amount: Math.round(breakdown.deposit * 100),
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
        });
    }
}
export async function verifyWebhookSignature(payload, signature) {
    const stripeInstance = await getStripe();
    const webhookSecret = ENV.stripeWebhookSecret;
    if (!webhookSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
    }
    return stripeInstance.webhooks.constructEvent(payload, signature, webhookSecret);
}
export function extractEnrollmentDataFromPayment(session) {
    const metadata = session.metadata;
    return {
        yearLevel: metadata.yearLevel,
        tier: metadata.tier,
        paymentMethod: metadata.paymentMethod,
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
export async function cancelSubscription(subscriptionId) {
    const stripeInstance = await getStripe();
    await stripeInstance.subscriptions.cancel(subscriptionId);
}
export async function getSubscriptionStatus(subscriptionId) {
    const stripeInstance = await getStripe();
    const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
    return subscription.status;
}
