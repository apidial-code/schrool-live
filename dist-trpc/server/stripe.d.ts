import type { YearLevel, Tier, PaymentMethod } from '../shared/pricing.js';
export interface CreateCheckoutSessionParams {
    yearLevel: YearLevel;
    tier: Tier;
    paymentMethod: PaymentMethod;
    studentName: string;
    studentEmail: string;
    studentAge: string;
    parentName: string;
    parentEmail: string;
    phone: string;
    userId: number;
    successUrl: string;
    cancelUrl: string;
    preferredDays?: string;
}
export declare function createEnrollmentCheckoutSession(params: CreateCheckoutSessionParams): Promise<any>;
export declare function verifyWebhookSignature(payload: string | Buffer, signature: string): Promise<any>;
export declare function extractEnrollmentDataFromPayment(session: any): any;
export declare function cancelSubscription(subscriptionId: string): Promise<void>;
export declare function getSubscriptionStatus(subscriptionId: string): Promise<string>;
