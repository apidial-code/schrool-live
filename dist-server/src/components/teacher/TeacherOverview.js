import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, MessageSquare, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
export default function TeacherOverview() {
    // DEMO MODE: Use static demo data instead of API calls
    const isDemoMode = true;
    const demoStats = {
        totalStudents: 5,
        pendingAssignments: 3,
        unreadMessages: 2,
        todaySessions: 2,
    };
    const demoTodaySessions = [
        {
            id: 1,
            studentName: "Alex Chen",
            startTime: new Date(new Date().setHours(15, 0, 0, 0)),
            endTime: new Date(new Date().setHours(16, 0, 0, 0)),
            zoomLink: "https://zoom.us/j/demo123",
            status: "scheduled",
        },
        {
            id: 2,
            studentName: "Emma Wilson",
            startTime: new Date(new Date().setHours(17, 0, 0, 0)),
            endTime: new Date(new Date().setHours(18, 0, 0, 0)),
            zoomLink: "https://zoom.us/j/demo456",
            status: "scheduled",
        },
    ];
    const demoPendingAssignments = [
        {
            id: 1,
            studentName: "Alex Chen",
            title: "Fractions Practice Set",
            submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 2,
            studentName: "Emma Wilson",
            title: "Decimals Worksheet",
            submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
        {
            id: 3,
            studentName: "Liam Brown",
            title: "Percentages Quiz",
            submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        },
    ];
    // Use API calls only if not in demo mode
    const { data: stats, isLoading: statsLoading } = trpc.teacher.getDashboardStats.useQuery(undefined, {
        enabled: !isDemoMode,
    });
    const { data: todaySessions, isLoading: sessionsLoading } = trpc.teacher.getTodaySessions.useQuery(undefined, {
        enabled: !isDemoMode,
    });
    const { data: pendingAssignments } = trpc.teacher.getPendingAssignments.useQuery(undefined, {
        enabled: !isDemoMode,
    });
    // Use demo data if in demo mode, otherwise use API data
    const displayStats = isDemoMode ? demoStats : stats;
    const displayTodaySessions = isDemoMode ? demoTodaySessions : todaySessions;
    const displayPendingAssignments = isDemoMode ? demoPendingAssignments : pendingAssignments;
    if (!isDemoMode && (statsLoading || sessionsLoading)) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Welcome back, Teacher!" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Here's what's happening with your Elite students today" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "My Students" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Users, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: displayStats?.totalStudents || 0 })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Elite tier students" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Pending Assignments" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ClipboardList, { className: "w-5 h-5 text-orange-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: displayStats?.pendingAssignments || 0 })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Awaiting grading" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Unread Messages" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: displayStats?.unreadMessages || 0 })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "From students & parents" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Today's Sessions" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5 text-purple-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: displayStats?.todaySessions || 0 })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Zoom sessions scheduled" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "w-5 h-5" }), "Today's Zoom Sessions"] }) }), _jsx(CardContent, { children: displayTodaySessions && displayTodaySessions.length > 0 ? (_jsx("div", { className: "space-y-3", children: displayTodaySessions.map((session) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold", children: (session.studentName ?? "").charAt(0) }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: session.studentName ?? "" }), _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-600 mt-1", children: [_jsx(Clock, { className: "w-4 h-4" }), _jsxs("span", { children: [format(session.startTime ?? session.scheduledAt ?? new Date() ?? new Date(), "h:mm a"), " - ", format(session.endTime ?? new Date((session.scheduledAt?.getTime?.() ?? 0) + session.duration * 60000) ?? new Date(), "h:mm a")] })] })] })] }), _jsx(Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", children: "Join Zoom" })] }, session.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Calendar, { className: "w-12 h-12 mx-auto mb-2 text-gray-400" }), _jsx("p", { children: "No sessions scheduled for today" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(ClipboardList, { className: "w-5 h-5" }), "Pending Assignments"] }) }), _jsx(CardContent, { children: displayPendingAssignments && displayPendingAssignments.length > 0 ? (_jsx("div", { className: "space-y-3", children: displayPendingAssignments.map((assignment) => (_jsxs("div", { className: "flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: assignment.title }), _jsxs("div", { className: "flex items-center gap-3 text-sm text-gray-600 mt-1", children: [_jsx("span", { children: assignment.studentName }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Submitted ", format(assignment.submittedAt ?? new Date(), "MMM d, h:mm a")] })] })] }), _jsx(Button, { size: "sm", variant: "outline", children: "Grade" })] }, assignment.id))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(ClipboardList, { className: "w-12 h-12 mx-auto mb-2 text-gray-400" }), _jsx("p", { children: "No pending assignments" })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-auto py-4 flex flex-col items-center gap-2", children: [_jsx(Users, { className: "w-6 h-6" }), _jsx("span", { children: "View All Students" })] }), _jsxs(Button, { variant: "outline", className: "h-auto py-4 flex flex-col items-center gap-2", children: [_jsx(Calendar, { className: "w-6 h-6" }), _jsx("span", { children: "Schedule Session" })] }), _jsxs(Button, { variant: "outline", className: "h-auto py-4 flex flex-col items-center gap-2", children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { children: "Send Message" })] })] }) })] })] }));
}
