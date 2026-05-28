/**
 * SCHROOL Platform Pricing Configuration
 *
 * Standard Tier: Same price for all year levels
 * Elite Tier: Year-specific pricing with 1-on-1 Zoom tutoring
 *
 * Payment Options:
 * - Upfront: Single payment
 * - Payment Plan: 30% deposit + 4 equal monthly payments
 */
export type YearLevel = 'year5-6' | 'year7' | 'year8' | 'year9';
export type Tier = 'standard' | 'elite';
export type PaymentMethod = 'upfront' | 'payment-plan';
export interface PricingDetails {
    upfront: number;
    paymentPlan: {
        total: number;
        deposit: number;
        monthlyPayment: number;
        numberOfPayments: number;
    };
}
export interface CoursePricing {
    standard: PricingDetails;
    elite: PricingDetails;
    duration: string;
    sessions: number;
}
/**
 * Complete pricing structure for all year levels and tiers
 */
export declare const PRICING: Record<YearLevel, CoursePricing>;
/**
 * Get pricing for a specific year level and tier
 */
export declare function getPricing(yearLevel: YearLevel, tier: Tier): PricingDetails;
/**
 * Calculate total cost based on payment method
 */
export declare function calculateTotalCost(yearLevel: YearLevel, tier: Tier, paymentMethod: PaymentMethod): number;
/**
 * Get payment breakdown for display
 */
export declare function getPaymentBreakdown(yearLevel: YearLevel, tier: Tier, paymentMethod: PaymentMethod): {
    total: number;
    deposit?: number;
    monthlyPayment?: number;
    numberOfPayments?: number;
    savings?: number;
};
/**
 * Format currency for display
 */
export declare function formatCurrency(amount: number | undefined): string;
/**
 * Get year level display name
 */
export declare function getYearLevelName(yearLevel: YearLevel): string;
/**
 * Get tier display name
 */
export declare function getTierName(tier: Tier): string;
