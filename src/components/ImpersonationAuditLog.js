import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Calendar, Clock, User, Filter } from "lucide-react";
export default function ImpersonationAuditLog() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [selectedRole, setSelectedRole] = useState();
    const { data: logs, isLoading, refetch } = trpc.admin.getImpersonationLogs.useQuery({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        targetUserRole: selectedRole,
        limit: 100,
    });
    const formatDuration = (seconds) => {
        if (!seconds)
            return "In Progress";
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    };
    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "bg-red-100 text-red-800";
            case "teacher":
                return "bg-purple-100 text-purple-800";
            case "parent":
                return "bg-green-100 text-green-800";
            case "student":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Shield, { className: "h-5 w-5 text-blue-600" }), _jsx(CardTitle, { children: "Impersonation Audit Log" })] }), _jsx(CardDescription, { children: "Track all admin impersonation events for security and compliance" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "mb-6 space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(Calendar, { className: "inline h-4 w-4 mr-1" }), "Start Date"] }), _jsx("input", { type: "date", value: startDate, onChange: (e) => setStartDate(e.target.value), className: "w-full px-4 py-2 border rounded-lg" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(Calendar, { className: "inline h-4 w-4 mr-1" }), "End Date"] }), _jsx("input", { type: "date", value: endDate, onChange: (e) => setEndDate(e.target.value), className: "w-full px-4 py-2 border rounded-lg" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium mb-2", children: [_jsx(Filter, { className: "inline h-4 w-4 mr-1" }), "Target Role"] }), _jsxs("select", { value: selectedRole || "", onChange: (e) => setSelectedRole(e.target.value || undefined), className: "w-full px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "", children: "All Roles" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "parent", children: "Parent" }), _jsx("option", { value: "teacher", children: "Teacher" }), _jsx("option", { value: "admin", children: "Admin" })] })] })] }), _jsxs(Button, { onClick: () => refetch(), variant: "outline", size: "sm", children: [_jsx(Filter, { className: "h-4 w-4 mr-2" }), "Apply Filters"] })] }), isLoading ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading logs..." })) : !logs || logs.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No impersonation logs found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Admin" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Target User" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Role" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Started At" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Ended At" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Duration" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Reason" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: logs.map((log) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-4 w-4 text-gray-400" }), _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: log.adminName }), _jsxs("div", { className: "text-xs text-gray-500", children: ["ID: ", log.adminId] })] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium text-sm", children: log.targetUserName }), _jsxs("div", { className: "text-xs text-gray-500", children: ["ID: ", log.targetUserId] })] }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("span", { className: `px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(log.targetUserRole)}`, children: log.targetUserRole }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: new Date(log.startedAt).toLocaleString() }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: log.endedAt ? new Date(log.endedAt).toLocaleString() : "In Progress" }), _jsx("td", { className: "px-4 py-3", children: _jsxs("div", { className: "flex items-center gap-1 text-sm", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-400" }), formatDuration(log.durationSeconds)] }) }), _jsx("td", { className: "px-4 py-3 text-sm text-gray-600", children: log.reason || "—" })] }, log.id))) })] }) })), logs && logs.length > 0 && (_jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsx("div", { className: "text-sm font-medium text-blue-900", children: "Total Events" }), _jsx("div", { className: "text-2xl font-bold text-blue-600 mt-1", children: logs.length })] }), _jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [_jsx("div", { className: "text-sm font-medium text-green-900", children: "Completed" }), _jsx("div", { className: "text-2xl font-bold text-green-600 mt-1", children: logs.filter((l) => l.endedAt).length })] }), _jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsx("div", { className: "text-sm font-medium text-orange-900", children: "In Progress" }), _jsx("div", { className: "text-2xl font-bold text-orange-600 mt-1", children: logs.filter((l) => !l.endedAt).length })] })] }))] })] }) }));
}
