import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, UserCheck, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
export default function AdminOverview() {
    const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
    const { data: recentActivity } = trpc.admin.getRecentActivity.useQuery({ limit: 10 });
    if (isLoading) {
        return _jsx("div", { className: "text-center py-8", children: "Loading dashboard statistics..." });
    }
    const statCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
        },
        {
            title: "Active Students",
            value: stats?.activeStudents || 0,
            icon: GraduationCap,
            color: "text-green-600",
            bgColor: "bg-green-100",
        },
        {
            title: "Active Teachers",
            value: stats?.activeTeachers || 0,
            icon: UserCheck,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
        },
        {
            title: "Total Enrollments",
            value: stats?.totalEnrollments || 0,
            icon: DollarSign,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100",
        },
        {
            title: "Pending Teachers",
            value: stats?.pendingTeachers || 0,
            icon: AlertCircle,
            color: "text-red-600",
            bgColor: "bg-red-100",
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (_jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: stat.title }), _jsx("p", { className: "text-3xl font-bold mt-2", children: stat.value })] }), _jsx("div", { className: `p-3 rounded-full ${stat.bgColor}`, children: _jsx(Icon, { className: `w-6 h-6 ${stat.color}` }) })] }) }) }, stat.title));
                }) }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: !recentActivity || recentActivity.length === 0 ? (_jsx("p", { className: "text-gray-500 text-sm", children: "No recent activity" })) : (_jsx("div", { className: "space-y-3", children: recentActivity.map((activity, index) => (_jsxs("div", { className: "flex items-center justify-between border-b pb-3 last:border-0", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: activity.description }), _jsxs("p", { className: "text-sm text-gray-500", children: [activity.user.email, " \u2022 ", activity.user.role] })] }), _jsx("span", { className: "text-xs text-gray-400", children: new Date(activity.timestamp).toLocaleDateString() })] }, index))) })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("button", { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors", children: [_jsx(Users, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }), _jsx("p", { className: "font-medium", children: "Create User" })] }), _jsxs("button", { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors", children: [_jsx(AlertCircle, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }), _jsx("p", { className: "font-medium", children: "Review Teachers" })] }), _jsxs("button", { className: "p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors", children: [_jsx(DollarSign, { className: "w-8 h-8 text-blue-600 mx-auto mb-2" }), _jsx("p", { className: "font-medium", children: "Process Payments" })] })] }) })] })] }));
}
