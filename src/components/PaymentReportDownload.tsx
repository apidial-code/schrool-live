import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Download, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

interface PaymentReportDownloadProps {
  teacherId?: number;
}

export default function PaymentReportDownload({ teacherId }: PaymentReportDownloadProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "paid" | "failed" | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/trpc/admin.generatePaymentPDF?input=${encodeURIComponent(
          JSON.stringify({
            json: {
              teacherId,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              status,
            },
          })
        )}`
      );

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
    } catch (error) {
      alert("Failed to generate PDF report. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        `/api/trpc/admin.generatePaymentReport?input=${encodeURIComponent(
          JSON.stringify({
            json: {
              teacherId,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
              status,
            },
          })
        )}`
      );

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
    } catch (error) {
      alert("Failed to generate report. Please try again.");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Reports</CardTitle>
        <CardDescription>
          Generate and download payment reports in CSV or PDF format
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Status</label>
            <select
              value={status || ""}
              onChange={(e) => setStatus(e.target.value as any || undefined)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={generateReport}
              disabled={isGenerating}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Download CSV"}
            </Button>
            <Button
              onClick={generatePDFReport}
              disabled={isGenerating}
              variant="outline"
            >
              <FileText className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Download PDF"}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Report Contents</p>
              <p className="text-sm text-blue-700 mt-1">
                Includes payment ID, teacher details, session counts, amounts, bank account info, and payment status.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
