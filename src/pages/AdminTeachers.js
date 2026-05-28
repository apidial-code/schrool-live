import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, UserCheck, UserX } from "lucide-react";
export default function AdminTeachers() {
    const [statusFilter, setStatusFilter] = useState("all");
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
    const handleApprove = (teacherId) => {
        if (confirm("Are you sure you want to approve this teacher?")) {
            approveMutation.mutate({ teacherId });
        }
    };
    const handleReject = (teacherId) => {
        if (confirm("Are you sure you want to reject this teacher application?")) {
            rejectMutation.mutate({ teacherId });
        }
    };
    const handleToggleStatus = (teacherId, currentStatus) => {
        const newStatus = currentStatus === 1;
        const action = newStatus ? "deactivate" : "activate";
        if (confirm(`Are you sure you want to ${action} this teacher?`)) {
            toggleStatusMutation.mutate({ teacherId, isActive: !newStatus });
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return _jsx(Badge, { variant: "secondary", children: "Pending" });
            case "approved":
                return _jsx(Badge, { className: "bg-green-500", children: "Approved" });
            case "rejected":
                return _jsx(Badge, { variant: "destructive", children: "Rejected" });
            case "suspended":
                return _jsx(Badge, { variant: "outline", children: "Suspended" });
            default:
                return _jsx(Badge, { children: status });
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsx("div", { className: "container max-w-7xl", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-3xl", children: "Teacher Management" }), _jsx(CardDescription, { children: "Review and manage teacher applications and profiles" }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsxs(Button, { variant: statusFilter === "all" ? "default" : "outline", size: "sm", onClick: () => setStatusFilter("all"), children: ["All (", teachers?.length || 0, ")"] }), _jsx(Button, { variant: statusFilter === "pending" ? "default" : "outline", size: "sm", onClick: () => setStatusFilter("pending"), children: "Pending" }), _jsx(Button, { variant: statusFilter === "approved" ? "default" : "outline", size: "sm", onClick: () => setStatusFilter("approved"), children: "Approved" }), _jsx(Button, { variant: statusFilter === "rejected" ? "default" : "outline", size: "sm", onClick: () => setStatusFilter("rejected"), children: "Rejected" })] })] }), _jsx(CardContent, { children: !teachers || teachers.length === 0 ? (_jsx("div", { className: "text-center py-12 text-muted-foreground", children: _jsx("p", { children: "No teachers found" }) })) : (_jsx("div", { className: "space-y-4", children: teachers.map((teacher) => (_jsx(Card, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold", children: teacher.userName || "Unknown" }), _jsx("p", { className: "text-sm text-muted-foreground", children: teacher.userEmail }), _jsxs("div", { className: "flex gap-2 mt-2", children: [getStatusBadge(teacher.status || "unknown"), teacher.isActive === 0 && (_jsx(Badge, { variant: "outline", className: "bg-gray-100", children: "Inactive" }))] })] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Applied: ", new Date(teacher.createdAt).toLocaleDateString()] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-2", children: "Specializations:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: teacher.specializations?.map((spec) => (_jsx(Badge, { variant: "secondary", children: spec }, spec))) })] }), _jsx("div", { children: _jsxs("p", { className: "text-sm font-medium", children: ["Timezone: ", teacher.timezone] }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-1", children: "Qualifications:" }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: teacher.qualifications })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-1", children: "Experience:" }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: teacher.experience })] }), teacher.bio && (_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium mb-1", children: "Bio:" }), _jsx("p", { className: "text-sm text-muted-foreground whitespace-pre-wrap", children: teacher.bio })] })), teacher.approvedAt && (_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Approved on: ", new Date(teacher.approvedAt).toLocaleDateString()] })), _jsxs("div", { className: "flex gap-2 pt-4 border-t", children: [teacher.status === "pending" && (_jsxs(_Fragment, { children: [_jsxs(Button, { size: "sm", onClick: () => handleApprove(teacher.id), disabled: approveMutation.isPending, children: [_jsx(CheckCircle, { className: "h-4 w-4 mr-2" }), "Approve"] }), _jsxs(Button, { size: "sm", variant: "destructive", onClick: () => handleReject(teacher.id), disabled: rejectMutation.isPending, children: [_jsx(XCircle, { className: "h-4 w-4 mr-2" }), "Reject"] })] })), teacher.status === "approved" && (_jsx(Button, { size: "sm", variant: "outline", onClick: () => handleToggleStatus(teacher.id, teacher.isActive || 0), disabled: toggleStatusMutation.isPending, children: teacher.isActive === 1 ? (_jsxs(_Fragment, { children: [_jsx(UserX, { className: "h-4 w-4 mr-2" }), "Deactivate"] })) : (_jsxs(_Fragment, { children: [_jsx(UserCheck, { className: "h-4 w-4 mr-2" }), "Activate"] })) }))] })] }) }, teacher.id))) })) })] }) }) }));
}
