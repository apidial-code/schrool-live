import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Building2, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
export default function TeacherBankAccount() {
    const { data: bankAccount, isLoading, refetch } = trpc.teacher.getBankAccount.useQuery();
    const submitMutation = trpc.teacher.submitBankAccount.useMutation({
        onSuccess: () => {
            refetch();
            setIsEditing(false);
            alert("Bank account submitted successfully!");
        },
    });
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        accountName: "",
        bsb: "",
        accountNumber: "",
        bankName: "",
    });
    const handleEdit = () => {
        if (bankAccount) {
            setFormData({
                accountName: bankAccount.accountName,
                bsb: bankAccount.bsb,
                accountNumber: bankAccount.accountNumber,
                bankName: bankAccount.bankName,
            });
        }
        setIsEditing(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate BSB
        if (!/^\d{6}$/.test(formData.bsb)) {
            alert("BSB must be exactly 6 digits");
            return;
        }
        // Validate account number
        if (!/^\d{6,10}$/.test(formData.accountNumber)) {
            alert("Account number must be 6-10 digits");
            return;
        }
        await submitMutation.mutateAsync(formData);
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "verified":
                return (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), "Verified"] }));
            case "pending":
                return (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium", children: [_jsx(Clock, { className: "w-4 h-4" }), "Pending Verification"] }));
            case "rejected":
                return (_jsxs("div", { className: "flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium", children: [_jsx(XCircle, { className: "w-4 h-4" }), "Rejected"] }));
            default:
                return null;
        }
    };
    if (isLoading) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "py-8", children: _jsx("p", { className: "text-center text-gray-500", children: "Loading bank account details..." }) }) }));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Bank Account Details" }), _jsx(CardDescription, { children: "Provide your bank account details to receive payments for completed sessions" })] }), bankAccount && (_jsx("div", { children: getStatusBadge(bankAccount.verified === 1 ? "verified" : bankAccount.verified === -1 ? "rejected" : "pending") }))] }) }), _jsx(CardContent, { children: !bankAccount && !isEditing ? (_jsxs("div", { className: "text-center py-8", children: [_jsx(Building2, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600 mb-4", children: "No bank account on file" }), _jsx(Button, { onClick: () => setIsEditing(true), children: "Add Bank Account" })] })) : isEditing ? (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Account Name" }), _jsx(Input, { placeholder: "John Smith", value: formData.accountName, onChange: (e) => setFormData({ ...formData, accountName: e.target.value }), required: true })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "BSB" }), _jsx(Input, { placeholder: "123456", value: formData.bsb, onChange: (e) => setFormData({ ...formData, bsb: e.target.value.replace(/\D/g, "").slice(0, 6) }), maxLength: 6, required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "6 digits" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Account Number" }), _jsx(Input, { placeholder: "12345678", value: formData.accountNumber, onChange: (e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }), maxLength: 10, required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "6-10 digits" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Bank Name" }), _jsx(Input, { placeholder: "Commonwealth Bank", value: formData.bankName, onChange: (e) => setFormData({ ...formData, bankName: e.target.value }), required: true })] }), bankAccount && bankAccount.verified === -1 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3", children: [_jsx(AlertCircle, { className: "w-5 h-5 text-red-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-900", children: "Previous submission was rejected" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "Please review your details and resubmit. Contact admin if you need assistance." })] })] })), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { type: "submit", disabled: submitMutation.isPending, children: submitMutation.isPending ? "Submitting..." : "Submit for Verification" }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setIsEditing(false), children: "Cancel" })] })] })) : (_jsxs("div", { className: "space-y-4", children: [bankAccount && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Account Name" }), _jsx("p", { className: "font-medium", children: bankAccount.accountName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Bank Name" }), _jsx("p", { className: "font-medium", children: bankAccount.bankName })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "BSB" }), _jsx("p", { className: "font-medium", children: bankAccount.bsb })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "Account Number" }), _jsx("p", { className: "font-medium", children: "*".repeat(bankAccount.accountNumber.length - 4) + bankAccount.accountNumber.slice(-4) })] })] })), bankAccount && bankAccount.verified === 0 && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3", children: [_jsx(Clock, { className: "w-5 h-5 text-yellow-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-yellow-900", children: "Verification Pending" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Your bank account is being verified by our admin team. You'll be notified once approved." })] })] })), bankAccount && bankAccount.verified === 1 && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-green-900", children: "Account Verified" }), _jsx("p", { className: "text-sm text-green-700 mt-1", children: "Your bank account has been verified. Payments will be processed to this account." })] })] })), _jsx(Button, { onClick: handleEdit, variant: "outline", children: "Update Bank Details" })] })) })] }));
}
