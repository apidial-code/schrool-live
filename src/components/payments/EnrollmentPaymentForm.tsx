import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EnrollmentPaymentFormProps {
  enrollmentId: number;
  courseTitle: string;
  standardPrice: number;
  elitePrice: number;
  tier: "standard" | "elite";
  onPaymentSuccess?: () => void;
}

export function EnrollmentPaymentForm({
  enrollmentId,
  courseTitle,
  standardPrice,
  elitePrice,
  tier,
  onPaymentSuccess,
}: EnrollmentPaymentFormProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"upfront" | "payment_plan">("upfront");
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
      } else {
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
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Enrollment Payment</CardTitle>
        <CardDescription>{courseTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Summary */}
        <div className="space-y-2 rounded-lg bg-slate-50 p-4">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Tier:</span>
            <span className="text-sm font-semibold uppercase">{tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Total Amount:</span>
            <span className="text-lg font-bold text-blue-600">
              ${(totalAmount / 100).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Payment Method</Label>

          <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
            {/* Upfront Payment */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-slate-50">
              <RadioGroupItem value="upfront" id="upfront" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="upfront" className="cursor-pointer font-medium">
                  Pay in Full
                </Label>
                <p className="text-sm text-slate-600">
                  ${(totalAmount / 100).toFixed(2)} due today
                </p>
              </div>
            </div>

            {/* Payment Plan */}
            <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-slate-50">
              <RadioGroupItem value="payment_plan" id="payment_plan" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="payment_plan" className="cursor-pointer font-medium">
                  Payment Plan (4 Months)
                </Label>
                <p className="text-sm text-slate-600">
                  ${(depositAmount / 100).toFixed(2)} deposit + ${(monthlyAmount / 100).toFixed(2)}/month
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Details */}
        {paymentMethod === "payment_plan" && (
          <div className="space-y-2 rounded-lg bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">Payment Schedule:</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Initial Deposit: ${(depositAmount / 100).toFixed(2)}</li>
              <li>• Monthly Payment (4x): ${(monthlyAmount / 100).toFixed(2)}</li>
              <li>• Total: ${(totalAmount / 100).toFixed(2)}</li>
            </ul>
          </div>
        )}

        {/* Payment Button */}
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Proceed to Payment (${paymentMethod === "upfront" ? "Full" : "Plan"})`
          )}
        </Button>

        {/* Security Note */}
        <p className="text-xs text-center text-slate-500">
          🔒 Secure payment powered by Stripe. Your payment information is encrypted.
        </p>
      </CardContent>
    </Card>
  );
}
