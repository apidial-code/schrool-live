/**
 * Complete pricing structure for all year levels and tiers
 */
export const PRICING = {
    'year5-6': {
        standard: {
            upfront: 997,
            paymentPlan: {
                total: 1118,
                deposit: 559, // 50% of total
                monthlyPayment: 186.33, // Remaining 559 / 3
                numberOfPayments: 3,
            },
        },
        elite: {
            upfront: 0.08,
            paymentPlan: {
                total: 0.10, // Test deposit
                deposit: 0.10, // Test deposit
                monthlyPayment: 0.00,
                numberOfPayments: 4,
            },
        },
        duration: '24 weeks',
        sessions: 48, // 2 per week
    },
    'year7': {
        standard: {
            upfront: 997,
            paymentPlan: {
                total: 1118,
                deposit: 335.40, // 30% of total
                monthlyPayment: 195.65, // Remaining 70% / 4
                numberOfPayments: 4,
            },
        },
        elite: {
            upfront: 0.08,
            paymentPlan: {
                total: 0.10, // Test deposit
                deposit: 0.10, // Test deposit
                monthlyPayment: 0.00,
                numberOfPayments: 4,
            },
        },
        duration: '26 weeks',
        sessions: 52,
    },
    'year8': {
        standard: {
            upfront: 997,
            paymentPlan: {
                total: 1118,
                deposit: 559,
                monthlyPayment: 186.33,
                numberOfPayments: 3,
            },
        },
        elite: {
            upfront: 0.08,
            paymentPlan: {
                total: 0.10, // Test deposit
                deposit: 0.10, // Test deposit
                monthlyPayment: 0.00,
                numberOfPayments: 4,
            },
        },
        duration: '28 weeks',
        sessions: 56,
    },
    'year9': {
        standard: {
            upfront: 997,
            paymentPlan: {
                total: 1118,
                deposit: 559,
                monthlyPayment: 186.33,
                numberOfPayments: 3,
            },
        },
        elite: {
            upfront: 0.08,
            paymentPlan: {
                total: 0.10, // Test deposit
                deposit: 0.10, // Test deposit
                monthlyPayment: 0.00,
                numberOfPayments: 4,
            },
        },
        duration: '30 weeks',
        sessions: 60,
    },
};
/**
 * Get pricing for a specific year level and tier
 */
export function getPricing(yearLevel, tier) {
    return PRICING[yearLevel][tier];
}
/**
 * Calculate total cost based on payment method
 */
export function calculateTotalCost(yearLevel, tier, paymentMethod) {
    const pricing = getPricing(yearLevel, tier);
    return paymentMethod === 'upfront' ? pricing.upfront : pricing.paymentPlan.total;
}
/**
 * Get payment breakdown for display
 */
export function getPaymentBreakdown(yearLevel, tier, paymentMethod) {
    const pricing = getPricing(yearLevel, tier);
    if (paymentMethod === 'upfront') {
        const savings = pricing.paymentPlan.total - pricing.upfront;
        return {
            total: pricing.upfront,
            savings: savings > 0 ? savings : undefined,
        };
    }
    return {
        total: pricing.paymentPlan.total,
        deposit: pricing.paymentPlan.deposit,
        monthlyPayment: pricing.paymentPlan.monthlyPayment,
        numberOfPayments: pricing.paymentPlan.numberOfPayments,
    };
}
/**
 * Format currency for display
 */
export function formatCurrency(amount) {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return '/usr/bin/bash.00';
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
/**
 * Get year level display name
 */
export function getYearLevelName(yearLevel) {
    const names = {
        'year5-6': 'Year 5/6',
        'year7': 'Year 7',
        'year8': 'Year 8',
        'year9': 'Year 9',
    };
    return names[yearLevel];
}
/**
 * Get tier display name
 */
export function getTierName(tier) {
    return tier === 'standard' ? 'Standard' : 'Premium Elite';
}
