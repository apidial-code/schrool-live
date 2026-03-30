import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { DollarSign, Calendar, Check, X, Eye } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminTeacherPayments() {
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [periodType, setPeriodType] = useState<"week" | "fortnight" | "month">("month");

  const { data: teachers } = trpc.admin.getAllTeachers.useQuery();
  const { data: payments, refetch: refetchPayments } = trpc.admin.getTeacherPayments.useQuery({});
  const { data: sessions } = trpc.admin.getTeacherSessions.useQuery(
    { teacherId: selectedTeacherId!, periodType },
    { enabled: !!selectedTeacherId }
  );

  const approvePaymentMutation = trpc.admin.approvePayment.useMutation({
    onSuccess: () => refetchPayments(),
  });

  const processPaymentMutation = trpc.admin.processPayment.useMutation({
    onSuccess: () => refetchPayments(),
  });

  const calculatePaymentMutation = trpc.admin.calculateTeacherPayment.useMutation({
    onSuccess: () => refetchPayments(),
  });

  const handleCalculatePayment = async (teacherId: number) => {
    const now = new Date();
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    await calculatePaymentMutation.mutateAsync({
      teacherId,
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
    });
  };

  const handleApprovePayment = async (paymentId: number) => {
    await approvePaymentMutation.mutateAsync({ paymentId });
  };

  const handleProcessPayment = async (paymentId: number) => {
    const reference = prompt("Enter payment reference:");
    if (reference) {
      await processPaymentMutation.mutateAsync({
        paymentId,
        paymentMethod: "Bank Transfer",
        paymentReference: reference,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Teacher Session Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Session Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <select
              value={selectedTeacherId || ""}
              onChange={(e) => setSelectedTeacherId(Number(e.target.value) || null)}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              <option value="">Select Teacher</option>
              {teachers?.map((teacher: any) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as any)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="week">Last Week</option>
              <option value="fortnight">Last Fortnight</option>
              <option value="month">Last Month</option>
            </select>
          </div>

          {selectedTeacherId && sessions && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-blue-600">{sessions.totalSessions}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${(sessions.totalSessions * 30).toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Rate Per Session</p>
                  <p className="text-3xl font-bold text-purple-600">$30.00</p>
                </div>
              </div>

              <Button
                onClick={() => handleCalculatePayment(selectedTeacherId)}
                disabled={calculatePaymentMutation.isPending}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Calculate Payment for Period
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Records */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {!payments || payments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No payment records found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sessions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">#{payment.teacherId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(payment.periodStart).toLocaleDateString()} - {new Date(payment.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{payment.totalSessions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">${payment.totalAmount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payment.status === "paid" ? "bg-green-100 text-green-800" :
                          payment.status === "approved" ? "bg-blue-100 text-blue-800" :
                          payment.status === "failed" ? "bg-red-100 text-red-800" :
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex gap-2 justify-end">
                          {payment.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprovePayment(payment.id)}
                              disabled={approvePaymentMutation.isPending}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          )}
                          {payment.status === "approved" && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayment(payment.id)}
                              disabled={processPaymentMutation.isPending}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
