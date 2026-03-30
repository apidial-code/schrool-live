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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Verified
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending Verification
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-gray-500">Loading bank account details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bank Account Details</CardTitle>
            <CardDescription>
              Provide your bank account details to receive payments for completed sessions
            </CardDescription>
          </div>
          {bankAccount && (
            <div>{getStatusBadge(bankAccount.verified === 1 ? "verified" : bankAccount.verified === -1 ? "rejected" : "pending")}</div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!bankAccount && !isEditing ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No bank account on file</p>
            <Button onClick={() => setIsEditing(true)}>
              Add Bank Account
            </Button>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Account Name</label>
              <Input
                placeholder="John Smith"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">BSB</label>
                <Input
                  placeholder="123456"
                  value={formData.bsb}
                  onChange={(e) => setFormData({ ...formData, bsb: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">6 digits</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Account Number</label>
                <Input
                  placeholder="12345678"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">6-10 digits</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bank Name</label>
              <Input
                placeholder="Commonwealth Bank"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                required
              />
            </div>

            {bankAccount && bankAccount.verified === -1 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Previous submission was rejected</p>
                  <p className="text-sm text-red-700 mt-1">
                    Please review your details and resubmit. Contact admin if you need assistance.
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {bankAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Account Name</p>
                  <p className="font-medium">{bankAccount.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-medium">{bankAccount.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">BSB</p>
                  <p className="font-medium">{bankAccount.bsb}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-medium">{"*".repeat(bankAccount.accountNumber.length - 4) + bankAccount.accountNumber.slice(-4)}</p>
                </div>
              </div>
            )}

            {bankAccount && bankAccount.verified === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Verification Pending</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Your bank account is being verified by our admin team. You'll be notified once approved.
                  </p>
                </div>
              </div>
            )}

            {bankAccount && bankAccount.verified === 1 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Account Verified</p>
                  <p className="text-sm text-green-700 mt-1">
                    Your bank account has been verified. Payments will be processed to this account.
                  </p>
                </div>
              </div>
            )}

            <Button onClick={handleEdit} variant="outline">
              Update Bank Details
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
