import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export function PaymentHistory({ enrollmentId }) {
    const { toast } = useToast();
    const [isGeneratingInvoice, setIsGeneratingInvoice] = React.useState(false);
    // Fetch payment history
    const { data: paymentData, isLoading: isLoadingPayments } = trpc.payments.getPaymentHistory.useQuery({ enrollmentId });
    // Fetch payment details
    const { data: paymentDetails, isLoading: isLoadingDetails } = trpc.payments.getEnrollmentPaymentDetails.useQuery({ enrollmentId });
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
        }
        catch (error) {
            console.error("Invoice generation error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to generate invoice",
                variant: "destructive",
            });
        }
        finally {
            setIsGeneratingInvoice(false);
        }
    };
    if (isLoadingPayments || isLoadingDetails) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "h-6 w-6 animate-spin text-slate-400" }) }) }));
    }
    if (!paymentData || !paymentDetails) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "flex items-center justify-center py-8", children: _jsx("p", { className: "text-slate-500", children: "No payment data available" }) }) }));
    }
    const getStatusColor = (status) => {
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
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Summary" }), _jsx(CardDescription, { children: "Enrollment payment status and details" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Course" }), _jsx("p", { className: "font-semibold", children: paymentDetails.courseTitle })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Tier" }), _jsx(Badge, { variant: "outline", className: "uppercase", children: paymentDetails.tier })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Payment Type" }), _jsx("p", { className: "font-semibold capitalize", children: paymentDetails.paymentType === "upfront" ? "Full Payment" : "Payment Plan" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-600", children: "Status" }), _jsx(Badge, { className: getStatusColor(paymentDetails.paymentStatus), children: paymentDetails.paymentStatus.toUpperCase() })] })] }), _jsxs("div", { className: "border-t pt-4 space-y-2", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Total Amount:" }), _jsx("span", { className: "font-semibold text-lg text-blue-600", children: paymentDetails.paymentAmount })] }), paymentDetails.paymentType === "payment_plan" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Deposit:" }), _jsx("span", { className: "font-medium", children: paymentDetails.depositAmount })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-slate-600", children: "Monthly Payment:" }), _jsx("span", { className: "font-medium", children: paymentDetails.monthlyAmount })] }), _jsxs("div", { className: "flex justify-between text-sm border-t pt-2", children: [_jsx("span", { className: "text-slate-600", children: "Installments Paid:" }), _jsxs("span", { className: "font-medium", children: [paymentDetails.installmentsPaid, " / ", paymentDetails.installmentsTotal] })] })] }))] }), _jsxs("div", { className: "border-t pt-4 space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Enrolled:" }), _jsx("span", { children: new Date(paymentDetails.enrolledAt).toLocaleDateString() })] }), paymentDetails.startDate && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "Start Date:" }), _jsx("span", { children: new Date(paymentDetails.startDate).toLocaleDateString() })] })), paymentDetails.endDate && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-slate-600", children: "End Date:" }), _jsx("span", { children: new Date(paymentDetails.endDate).toLocaleDateString() })] }))] }), _jsx(Button, { onClick: handleGenerateInvoice, disabled: isGeneratingInvoice, className: "w-full mt-4", variant: "outline", children: isGeneratingInvoice ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Generating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Download Invoice"] })) })] })] }), paymentData.payments && paymentData.payments.length > 0 && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment History" }), _jsx(CardDescription, { children: "All transactions for this enrollment" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: paymentData.payments.map((payment) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg border p-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "font-medium", children: payment.id }), _jsx("p", { className: "text-sm text-slate-600", children: new Date(payment.created).toLocaleDateString() })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold", children: ["$", (payment.amount / 100).toFixed(2)] }), _jsx(Badge, { className: getStatusColor(payment.status), children: payment.status.toUpperCase() })] })] }, payment.id))) }) })] })), (!paymentData.payments || paymentData.payments.length === 0) &&
                paymentDetails.paymentStatus !== "paid" && (_jsx(Card, { className: "border-yellow-200 bg-yellow-50", children: _jsxs(CardContent, { className: "flex items-start space-x-3 pt-6", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-yellow-900", children: "No payments yet" }), _jsx("p", { className: "text-sm text-yellow-800", children: "Your enrollment payment is still pending. Complete the payment to activate your course access." })] })] }) }))] }));
}
