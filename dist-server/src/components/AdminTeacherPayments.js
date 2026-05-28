import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DollarSign, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
export default function AdminTeacherPayments() {
    const [selectedTeacherId, setSelectedTeacherId] = useState(null);
    const [periodType, setPeriodType] = useState("month");
    const { data: teachers } = trpc.admin.getAllTeachers.useQuery();
    const { data: payments, refetch: refetchPayments } = trpc.admin.getTeacherPayments.useQuery({});
    const { data: sessions } = trpc.admin.getTeacherSessions.useQuery({ teacherId: selectedTeacherId, periodType }, { enabled: !!selectedTeacherId });
    const approvePaymentMutation = trpc.admin.approvePayment.useMutation({
        onSuccess: () => refetchPayments(),
    });
    const processPaymentMutation = trpc.admin.processPayment.useMutation({
        onSuccess: () => refetchPayments(),
    });
    const calculatePaymentMutation = trpc.admin.calculateTeacherPayment.useMutation({
        onSuccess: () => refetchPayments(),
    });
    const handleCalculatePayment = async (teacherId) => {
        const now = new Date();
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        await calculatePaymentMutation.mutateAsync({
            teacherId,
            periodStart: start.toISOString(),
            periodEnd: now.toISOString(),
        });
    };
    const handleApprovePayment = async (paymentId) => {
        await approvePaymentMutation.mutateAsync({ paymentId });
    };
    const handleProcessPayment = async (paymentId) => {
        const reference = prompt("Enter payment reference:");
        if (reference) {
            await processPaymentMutation.mutateAsync({
                paymentId,
                paymentMethod: "Bank Transfer",
                paymentReference: reference,
            });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Teacher Session Tracking" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex gap-4 mb-4", children: [_jsxs("select", { value: selectedTeacherId || "", onChange: (e) => setSelectedTeacherId(Number(e.target.value) || null), className: "flex-1 px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "", children: "Select Teacher" }), teachers?.map((teacher) => (_jsx("option", { value: teacher.id, children: teacher.name }, teacher.id)))] }), _jsxs("select", { value: periodType, onChange: (e) => setPeriodType(e.target.value), className: "px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "week", children: "Last Week" }), _jsx("option", { value: "fortnight", children: "Last Fortnight" }), _jsx("option", { value: "month", children: "Last Month" })] })] }), selectedTeacherId && sessions && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Sessions" }), _jsx("p", { className: "text-3xl font-bold text-blue-600", children: sessions.totalSessions })] }), _jsxs("div", { className: "bg-green-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total Amount" }), _jsxs("p", { className: "text-3xl font-bold text-green-600", children: ["$", (sessions.totalSessions * 30).toFixed(2)] })] }), _jsxs("div", { className: "bg-purple-50 p-4 rounded-lg", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Rate Per Session" }), _jsx("p", { className: "text-3xl font-bold text-purple-600", children: "$30.00" })] })] }), _jsxs(Button, { onClick: () => handleCalculatePayment(selectedTeacherId), disabled: calculatePaymentMutation.isPending, children: [_jsx(DollarSign, { className: "w-4 h-4 mr-2" }), "Calculate Payment for Period"] })] }))] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Payment Records" }) }), _jsx(CardContent, { children: !payments || payments.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No payment records found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Teacher ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Period" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Sessions" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Amount" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Status" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: payments.map((payment) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: ["#", payment.teacherId] }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: [new Date(payment.periodStart).toLocaleDateString(), " - ", new Date(payment.periodEnd).toLocaleDateString()] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: payment.totalSessions }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-semibold", children: ["$", payment.totalAmount] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${payment.status === "paid" ? "bg-green-100 text-green-800" :
                                                            payment.status === "approved" ? "bg-blue-100 text-blue-800" :
                                                                payment.status === "failed" ? "bg-red-100 text-red-800" :
                                                                    "bg-yellow-100 text-yellow-800"}`, children: payment.status }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm", children: _jsxs("div", { className: "flex gap-2 justify-end", children: [payment.status === "pending" && (_jsxs(Button, { size: "sm", variant: "outline", onClick: () => handleApprovePayment(payment.id), disabled: approvePaymentMutation.isPending, children: [_jsx(Check, { className: "w-4 h-4 mr-1" }), "Approve"] })), payment.status === "approved" && (_jsxs(Button, { size: "sm", onClick: () => handleProcessPayment(payment.id), disabled: processPaymentMutation.isPending, children: [_jsx(DollarSign, { className: "w-4 h-4 mr-1" }), "Mark Paid"] }))] }) })] }, payment.id))) })] }) })) })] })] }));
}
