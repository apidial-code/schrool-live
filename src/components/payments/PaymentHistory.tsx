import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentHistoryProps {
  enrollmentId: number;
}

export function PaymentHistory({ enrollmentId }: PaymentHistoryProps) {
  const { toast } = useToast();
  const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);

  // Fetch payment history
  const { data: paymentData, isLoading: isLoadingPayments } =
    trpc.payments.getPaymentHistory.useQuery({ enrollmentId });

  // Fetch payment details
  const { data: paymentDetails, isLoading: isLoadingDetails } =
    trpc.payments.getEnrollmentPaymentDetails.useQuery({ enrollmentId });

  // Generate invoice mutation
  const generateInvoiceMutation = trpc.payments.generateInvoice.useMutation();

  const handleGenerateInvoice = async () => {
    try {
      setIsGeneratingInvoice(true);
      const result = await generateInvoiceMutation.mutateAsync({ enrollmentId });

      if (result.invoiceUrl) {
        // Download the invoice
        const link = document.createElement("a");
        link.href = result.invoiceUrl;
        link.download = `Invoice-${result.invoiceNumber}.pdf`;
        link.click();

        toast({
          title: "Invoice Generated",
          description: `Invoice ${result.invoiceNumber} has been downloaded.`,
        });
      }
    } catch (error) {
      console.error("Invoice generation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate invoice",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (isLoadingPayments || isLoadingDetails) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    );
  }

  if (!paymentData || !paymentDetails) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-slate-500">No payment data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
          <CardDescription>Enrollment payment status and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Course</p>
              <p className="font-semibold">{paymentDetails.courseTitle}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Tier</p>
              <Badge variant="outline" className="uppercase">
                {paymentDetails.tier}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600">Payment Type</p>
              <p className="font-semibold capitalize">
                {paymentDetails.paymentType === "upfront" ? "Full Payment" : "Payment Plan"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge className={getStatusColor(paymentDetails.paymentStatus)}>
                {paymentDetails.paymentStatus.toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Amount Details */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Amount:</span>
              <span className="font-semibold text-lg text-blue-600">
                {paymentDetails.paymentAmount}
              </span>
            </div>

            {paymentDetails.paymentType === "payment_plan" && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Deposit:</span>
                  <span className="font-medium">{paymentDetails.depositAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Monthly Payment:</span>
                  <span className="font-medium">{paymentDetails.monthlyAmount}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-slate-600">Installments Paid:</span>
                  <span className="font-medium">
                    {paymentDetails.installmentsPaid} / {paymentDetails.installmentsTotal}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Enrollment Dates */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Enrolled:</span>
              <span>{new Date(paymentDetails.enrolledAt).toLocaleDateString()}</span>
            </div>
            {paymentDetails.startDate && (
              <div className="flex justify-between">
                <span className="text-slate-600">Start Date:</span>
                <span>{new Date(paymentDetails.startDate).toLocaleDateString()}</span>
              </div>
            )}
            {paymentDetails.endDate && (
              <div className="flex justify-between">
                <span className="text-slate-600">End Date:</span>
                <span>{new Date(paymentDetails.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Generate Invoice Button */}
          <Button
            onClick={handleGenerateInvoice}
            disabled={isGeneratingInvoice}
            className="w-full mt-4"
            variant="outline"
          >
            {isGeneratingInvoice ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentData.payments && paymentData.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All transactions for this enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentData.payments.map((payment: any) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium">{payment.id}</p>
                    <p className="text-sm text-slate-600">
                      {new Date(payment.created).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(payment.amount / 100).toFixed(2)}</p>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Payments */}
      {(!paymentData.payments || paymentData.payments.length === 0) &&
        paymentDetails.paymentStatus !== "paid" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-start space-x-3 pt-6">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">No payments yet</p>
                <p className="text-sm text-yellow-800">
                  Your enrollment payment is still pending. Complete the payment to activate your
                  course access.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
