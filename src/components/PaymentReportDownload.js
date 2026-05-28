import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
export default function PaymentReportDownload({ teacherId }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [status, setStatus] = useState();
    const [isGenerating, setIsGenerating] = useState(false);
    const generatePDFReport = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/trpc/admin.generatePaymentPDF?input=${encodeURIComponent(JSON.stringify({
                json: {
                    teacherId,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    status,
                },
            }))}`);
            const data = await response.json();
            const pdfBase64 = data.result.data.json.pdfBase64;
            // Convert base64 to blob and download
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `payment-report-${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert(`PDF report generated successfully! ${data.result.data.json.totalPayments} payments exported.`);
        }
        catch (error) {
            alert("Failed to generate PDF report. Please try again.");
            console.error(error);
        }
        finally {
            setIsGenerating(false);
        }
    };
    const generateReport = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch(`/api/trpc/admin.generatePaymentReport?input=${encodeURIComponent(JSON.stringify({
                json: {
                    teacherId,
                    startDate: startDate || undefined,
                    endDate: endDate || undefined,
                    status,
                },
            }))}`);
            const data = await response.json();
            const csvContent = data.result.data.json.csvContent;
            // Create download
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `payment-report-${new Date().toISOString().split("T")[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            alert(`Report generated successfully! ${data.result.data.json.totalPayments} payments exported.`);
        }
        catch (error) {
            alert("Failed to generate report. Please try again.");
            console.error(error);
        }
        finally {
            setIsGenerating(false);
        }
    };
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Payment Reports" }), _jsx(CardDescription, { children: "Generate and download payment reports in CSV or PDF format" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Start Date" }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "w-full px-4 py-2 border rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "End Date" }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "w-full px-4 py-2 border rounded-lg" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Payment Status" }), _jsxs("select", { value: status || "", onChange: (e) => setStatus(e.target.value || undefined), className: "w-full px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "approved", children: "Approved" }), _jsx("option", { value: "paid", children: "Paid" }), _jsx("option", { value: "failed", children: "Failed" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Button, { onClick: generateReport, disabled: isGenerating, children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), isGenerating ? "Generating..." : "Download CSV"] }), _jsxs(Button, { onClick: generatePDFReport, disabled: isGenerating, variant: "outline", children: [_jsx(FileText, { className: "w-4 h-4 mr-2" }), isGenerating ? "Generating..." : "Download PDF"] })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3", children: [_jsx(FileText, { className: "w-5 h-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-blue-900", children: "Report Contents" }), _jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Includes payment ID, teacher details, session counts, amounts, bank account info, and payment status." })] })] })] }) })] }));
}
