import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Mail, MessageSquare, CheckCircle, AlertCircle, Trophy, BookOpen } from "lucide-react";
export default function ParentNotifications() {
    const [filter, setFilter] = useState("all");
    // Mock data for demonstration
    const notifications = [
        {
            id: 1,
            studentName: "Emma Johnson",
            type: "lesson_completed",
            title: "Lesson Completed: Fractions Basics",
            message: "Emma has successfully completed the Fractions Basics lesson with a score of 9/10. Great work!",
            priority: "medium",
            read: 0,
            sentViaEmail: 1,
            sentViaSms: 0,
            createdAt: "2026-01-23T10:30:00",
        },
        {
            id: 2,
            studentName: "Emma Johnson",
            type: "badge_earned",
            title: "Achievement Unlocked: Silver Badge!",
            message: "Congratulations! Emma has earned a Silver Badge for completing 25 lessons. This is a significant milestone!",
            priority: "high",
            read: 0,
            sentViaEmail: 1,
            sentViaSms: 1,
            createdAt: "2026-01-23T09:15:00",
        },
        {
            id: 3,
            studentName: "Emma Johnson",
            type: "needs_attention",
            title: "Learning Support Needed",
            message: "Emma has attempted the Decimals lesson 3 times without reaching the 8/10 threshold. Consider scheduling a teacher session for additional support.",
            priority: "high",
            read: 1,
            sentViaEmail: 1,
            sentViaSms: 0,
            createdAt: "2026-01-22T14:20:00",
            readAt: "2026-01-22T15:30:00",
        },
        {
            id: 4,
            studentName: "Emma Johnson",
            type: "weekly_summary",
            title: "Weekly Progress Summary",
            message: "This week Emma completed 4 lessons, achieved 2 perfect scores, and maintained a 5-day learning streak. Total time spent: 3.5 hours.",
            priority: "low",
            read: 1,
            sentViaEmail: 1,
            sentViaSms: 0,
            createdAt: "2026-01-21T18:00:00",
            readAt: "2026-01-21T19:45:00",
        },
    ];
    const getTypeIcon = (type) => {
        if (type === "lesson_completed")
            return _jsx(BookOpen, { className: "w-5 h-5 text-blue-600" });
        if (type === "badge_earned")
            return _jsx(Trophy, { className: "w-5 h-5 text-yellow-600" });
        if (type === "needs_attention")
            return _jsx(AlertCircle, { className: "w-5 h-5 text-red-600" });
        if (type === "weekly_summary")
            return _jsx(CheckCircle, { className: "w-5 h-5 text-green-600" });
        return _jsx(Bell, { className: "w-5 h-5 text-gray-600" });
    };
    const getPriorityColor = (priority) => {
        if (priority === "high")
            return "border-l-4 border-l-red-500 bg-red-50";
        if (priority === "medium")
            return "border-l-4 border-l-yellow-500 bg-yellow-50";
        return "border-l-4 border-l-green-500 bg-green-50";
    };
    const filteredNotifications = notifications.filter((notif) => {
        if (filter === "unread")
            return notif.read === 0;
        if (filter === "high")
            return notif.priority === "high";
        return true;
    });
    const unreadCount = notifications.filter((n) => n.read === 0).length;
    const highPriorityCount = notifications.filter((n) => n.priority === "high" && n.read === 0).length;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Notifications" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Stay updated on your child's learning progress" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Button, { variant: filter === "all" ? "default" : "outline", size: "sm", onClick: () => setFilter("all"), children: ["All (", notifications.length, ")"] }), _jsxs(Button, { variant: filter === "unread" ? "default" : "outline", size: "sm", onClick: () => setFilter("unread"), children: ["Unread (", unreadCount, ")"] }), _jsxs(Button, { variant: filter === "high" ? "default" : "outline", size: "sm", onClick: () => setFilter("high"), children: [_jsx(AlertCircle, { className: "w-4 h-4 mr-1" }), "High Priority (", highPriorityCount, ")"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Notifications" }), _jsx("p", { className: "text-2xl font-bold text-gray-900 mt-1", children: notifications.length })] }), _jsx("div", { className: "h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx(Bell, { className: "h-6 w-6 text-blue-600" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Unread" }), _jsx("p", { className: "text-2xl font-bold text-orange-600 mt-1", children: unreadCount })] }), _jsx("div", { className: "h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center", children: _jsx(Mail, { className: "h-6 w-6 text-orange-600" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "High Priority" }), _jsx("p", { className: "text-2xl font-bold text-red-600 mt-1", children: highPriorityCount })] }), _jsx("div", { className: "h-12 w-12 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertCircle, { className: "h-6 w-6 text-red-600" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Via SMS" }), _jsx("p", { className: "text-2xl font-bold text-green-600 mt-1", children: notifications.filter((n) => n.sentViaSms === 1).length })] }), _jsx("div", { className: "h-12 w-12 bg-green-100 rounded-full flex items-center justify-center", children: _jsx(MessageSquare, { className: "h-6 w-6 text-green-600" }) })] }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Notifications" }), _jsx(CardDescription, { children: "Updates about your child's learning journey" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-3", children: filteredNotifications.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Bell, { className: "w-12 h-12 mx-auto mb-3 opacity-50" }), _jsx("p", { children: "No notifications match your filter" })] })) : (filteredNotifications.map((notif) => (_jsx("div", { className: `p-4 rounded-lg ${getPriorityColor(notif.priority)} ${notif.read === 0 ? "shadow-md" : "opacity-75"}`, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3 flex-1", children: [_jsx("div", { className: "mt-1", children: getTypeIcon(notif.type) }), _jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: notif.title }), notif.read === 0 && (_jsx("span", { className: "px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full", children: "New" }))] }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: notif.message }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-600", children: [_jsx("span", { children: notif.studentName }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: new Date(notif.createdAt).toLocaleString() }), notif.sentViaEmail === 1 && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Mail, { className: "w-3 h-3" }), " Email sent"] })] })), notif.sentViaSms === 1 && (_jsxs(_Fragment, { children: [_jsx("span", { children: "\u2022" }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(MessageSquare, { className: "w-3 h-3" }), " SMS sent"] })] }))] })] })] }), notif.read === 0 && (_jsx(Button, { variant: "outline", size: "sm", children: "Mark as Read" }))] }) }, notif.id)))) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Notification Preferences" }), _jsx(CardDescription, { children: "Choose how you want to receive updates" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: "Lesson Completion" }), _jsx("p", { className: "text-sm text-gray-600", children: "Get notified when your child completes a lesson" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "Email"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", className: "rounded" }), "SMS"] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: "Achievement Badges" }), _jsx("p", { className: "text-sm text-gray-600", children: "Get notified when your child earns a badge" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "Email"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "SMS"] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: "Needs Attention" }), _jsx("p", { className: "text-sm text-gray-600", children: "Get notified when your child needs learning support" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "Email"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "SMS"] })] })] }), _jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold text-gray-900", children: "Weekly Summary" }), _jsx("p", { className: "text-sm text-gray-600", children: "Receive a weekly progress report every Sunday" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", defaultChecked: true, className: "rounded" }), "Email"] }), _jsxs("label", { className: "flex items-center gap-2 text-sm", children: [_jsx("input", { type: "checkbox", className: "rounded" }), "SMS"] })] })] })] }), _jsx(Button, { className: "mt-4 w-full", children: "Save Preferences" })] })] })] }));
}
