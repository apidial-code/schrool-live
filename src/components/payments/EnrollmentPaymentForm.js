import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
export function EnrollmentPaymentForm({ enrollmentId, courseTitle, standardPrice, elitePrice, tier, onPaymentSuccess, }) {
    const { toast } = useToast();
    const [paymentMethod, setPaymentMethod] = useState("upfront");
    const [isLoading, setIsLoading] = useState(false);
    const createCheckoutMutation = trpc.payments.createCheckoutSession.useMutation();
    const createPaymentPlanMutation = trpc.payments.createPaymentPlanSubscription.useMutation();
    const totalAmount = tier === "elite" ? elitePrice : standardPrice;
    const depositAmount = Math.round(totalAmount * 0.3); // 30% deposit
    const monthlyAmount = Math.round((totalAmount - depositAmount) / 4); // 4 monthly payments
    const handlePayment = async () => {
        try {
            setIsLoading(true);
            const successUrl = `${window.location.origin}/payment-success?enrollmentId=${enrollmentId}`;
            const cancelUrl = `${window.location.origin}/payment-cancel?enrollmentId=${enrollmentId}`;
            if (paymentMethod === "upfront") {
                // Create upfront payment checkout
                const result = await createCheckoutMutation.mutateAsync({
                    enrollmentId,
                    courseTitle: `${courseTitle} - ${tier.toUpperCase()}`,
                    amount: totalAmount * 100, // Convert to cents
                    paymentType: "upfront",
                    successUrl,
                    cancelUrl,
                });
                if (result.checkoutUrl) {
                    // Open checkout in new tab
                    window.open(result.checkoutUrl, "_blank");
                    toast({
                        title: "Redirecting to Checkout",
                        description: "You will be redirected to Stripe checkout in a new tab.",
                    });
                }
            }
            else {
                // Create payment plan subscription
                const result = await createPaymentPlanMutation.mutateAsync({
                    enrollmentId,
                    courseTitle: `${courseTitle} - ${tier.toUpperCase()} (Payment Plan)`,
                    amount: depositAmount * 100, // Deposit in cents
                    monthlyAmount: monthlyAmount * 100, // Monthly in cents
                    installments: 4,
                    successUrl,
                    cancelUrl,
                });
                if (result.checkoutUrl) {
                    // Open checkout in new tab
                    window.open(result.checkoutUrl, "_blank");
                    toast({
                        title: "Redirecting to Checkout",
                        description: "You will be redirected to Stripe checkout in a new tab.",
                    });
                }
            }
        }
        catch (error) {
            console.error("Payment error:", error);
            toast({
                title: "Payment Error",
                description: error instanceof Error ? error.message : "Failed to process payment",
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs(Card, { className: "w-full max-w-md", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Enrollment Payment" }), _jsx(CardDescription, { children: courseTitle })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-2 rounded-lg bg-slate-50 p-4", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Tier:" }), _jsx("span", { className: "text-sm font-semibold uppercase", children: tier })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm font-medium", children: "Total Amount:" }), _jsxs("span", { className: "text-lg font-bold text-blue-600", children: ["$", (totalAmount / 100).toFixed(2)] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Label, { className: "text-base font-semibold", children: "Payment Method" }), _jsxs(RadioGroup, { value: paymentMethod, onValueChange: (value) => setPaymentMethod(value), children: [_jsxs("div", { className: "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-slate-50", children: [_jsx(RadioGroupItem, { value: "upfront", id: "upfront", className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "upfront", className: "cursor-pointer font-medium", children: "Pay in Full" }), _jsxs("p", { className: "text-sm text-slate-600", children: ["$", (totalAmount / 100).toFixed(2), " due today"] })] })] }), _jsxs("div", { className: "flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-slate-50", children: [_jsx(RadioGroupItem, { value: "payment_plan", id: "payment_plan", className: "mt-1" }), _jsxs("div", { className: "flex-1", children: [_jsx(Label, { htmlFor: "payment_plan", className: "cursor-pointer font-medium", children: "Payment Plan (4 Months)" }), _jsxs("p", { className: "text-sm text-slate-600", children: ["$", (depositAmount / 100).toFixed(2), " deposit + $", (monthlyAmount / 100).toFixed(2), "/month"] })] })] })] })] }), paymentMethod === "payment_plan" && (_jsxs("div", { className: "space-y-2 rounded-lg bg-blue-50 p-4", children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: "Payment Schedule:" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("li", { children: ["\u2022 Initial Deposit: $", (depositAmount / 100).toFixed(2)] }), _jsxs("li", { children: ["\u2022 Monthly Payment (4x): $", (monthlyAmount / 100).toFixed(2)] }), _jsxs("li", { children: ["\u2022 Total: $", (totalAmount / 100).toFixed(2)] })] })] })), _jsx(Button, { onClick: handlePayment, disabled: isLoading, className: "w-full bg-blue-600 hover:bg-blue-700", size: "lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Processing..."] })) : (`Proceed to Payment (${paymentMethod === "upfront" ? "Full" : "Plan"})`) }), _jsx("p", { className: "text-xs text-center text-slate-500", children: "\uD83D\uDD12 Secure payment powered by Stripe. Your payment information is encrypted." })] })] }));
}
