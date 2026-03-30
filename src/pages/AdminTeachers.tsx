import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, UserCheck, UserX } from "lucide-react";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminTeachers() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const utils = trpc.useUtils();

  const { data: teachers, isLoading } = trpc.teacher.getAllTeachers.useQuery({
    status: statusFilter,
  });

  const approveMutation = trpc.teacher.approveTeacher.useMutation({
    onSuccess: () => {
      toast.success("Teacher approved successfully!");
      utils.teacher.getAllTeachers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve teacher");
    },
  });

  const rejectMutation = trpc.teacher.rejectTeacher.useMutation({
    onSuccess: () => {
      toast.success("Teacher application rejected");
      utils.teacher.getAllTeachers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject teacher");
    },
  });

  const toggleStatusMutation = trpc.teacher.toggleTeacherStatus.useMutation({
    onSuccess: () => {
      toast.success("Teacher status updated");
      utils.teacher.getAllTeachers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleApprove = (teacherId: number) => {
    if (confirm("Are you sure you want to approve this teacher?")) {
      approveMutation.mutate({ teacherId });
    }
  };

  const handleReject = (teacherId: number) => {
    if (confirm("Are you sure you want to reject this teacher application?")) {
      rejectMutation.mutate({ teacherId });
    }
  };

  const handleToggleStatus = (teacherId: number, currentStatus: number) => {
    const newStatus = currentStatus === 1;
    const action = newStatus ? "deactivate" : "activate";
    if (confirm(`Are you sure you want to ${action} this teacher?`)) {
      toggleStatusMutation.mutate({ teacherId, isActive: !newStatus });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "suspended":
        return <Badge variant="outline">Suspended</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Teacher Management</CardTitle>
            <CardDescription>Review and manage teacher applications and profiles</CardDescription>

            {/* Status Filter */}
            <div className="flex gap-2 pt-4">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All ({teachers?.length || 0})
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "approved" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("approved")}
              >
                Approved
              </Button>
              <Button
                variant={statusFilter === "rejected" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!teachers || teachers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No teachers found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Card key={teacher.id} className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold">{teacher.userName || "Unknown"}</h3>
                          <p className="text-sm text-muted-foreground">{teacher.userEmail}</p>
                          <div className="flex gap-2 mt-2">
                            {getStatusBadge(teacher.status || "unknown")}
                            {teacher.isActive === 0 && (
                              <Badge variant="outline" className="bg-gray-100">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Applied: {new Date(teacher.createdAt!).toLocaleDateString()}
                        </div>
                      </div>

                      {/* Specializations */}
                      <div>
                        <p className="text-sm font-medium mb-2">Specializations:</p>
                        <div className="flex flex-wrap gap-2">
                          {teacher.specializations?.map((spec: string) => (
                            <Badge key={spec} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Timezone */}
                      <div>
                        <p className="text-sm font-medium">Timezone: {teacher.timezone}</p>
                      </div>

                      {/* Qualifications */}
                      <div>
                        <p className="text-sm font-medium mb-1">Qualifications:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {teacher.qualifications}
                        </p>
                      </div>

                      {/* Experience */}
                      <div>
                        <p className="text-sm font-medium mb-1">Experience:</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {teacher.experience}
                        </p>
                      </div>

                      {/* Bio */}
                      {teacher.bio && (
                        <div>
                          <p className="text-sm font-medium mb-1">Bio:</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {teacher.bio}
                          </p>
                        </div>
                      )}

                      {/* Approval Info */}
                      {teacher.approvedAt && (
                        <div className="text-sm text-muted-foreground">
                          Approved on: {new Date(teacher.approvedAt).toLocaleDateString()}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        {teacher.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(teacher.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(teacher.id)}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}

                        {teacher.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(teacher.id, teacher.isActive || 0)}
                            disabled={toggleStatusMutation.isPending}
                          >
                            {teacher.isActive === 1 ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
