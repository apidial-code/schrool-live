import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
export default function DemoLanding() {
    const roles = [
        {
            value: "student",
            name: "Student Dashboard",
            description: "View lessons, track progress, and submit questions",
            icon: GraduationCap,
            color: "bg-blue-500",
            path: "/student",
        },
        {
            value: "parent",
            name: "Parent Dashboard",
            description: "Monitor your child's learning journey and achievements",
            icon: Users,
            color: "bg-green-500",
            path: "/parent",
        },
        {
            value: "teacher",
            name: "Teacher Dashboard",
            description: "Manage students, assignments, and resources",
            icon: BookOpen,
            color: "bg-purple-500",
            path: "/teacher",
        },
        {
            value: "admin",
            name: "Admin Dashboard",
            description: "Full system administration and analytics control",
            icon: Shield,
            color: "bg-red-500",
            path: "/admin",
        },
    ];
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "w-full max-w-6xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-5xl font-bold text-gray-900 mb-3", children: "SCHROOL Learning Platform" }), _jsx("p", { className: "text-xl text-gray-700 mb-2", children: "Year 5-9 Mathematics Excellence" }), _jsxs("div", { className: "inline-block bg-orange-100 border-2 border-orange-500 rounded-lg px-6 py-3 mt-4", children: [_jsx("p", { className: "text-lg text-orange-700 font-bold", children: "\uD83C\uDFAF DEMO MODE - Board Presentation" }), _jsx("p", { className: "text-sm text-orange-600 mt-1", children: "No authentication required \u2022 Full access to all dashboards" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: roles.map((role) => {
                        const Icon = role.icon;
                        return (_jsxs(Card, { className: "hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: `w-16 h-16 ${role.color} rounded-full flex items-center justify-center mb-4 mx-auto`, children: _jsx(Icon, { className: "h-8 w-8 text-white" }) }), _jsx(CardTitle, { className: "text-center text-lg", children: role.name }), _jsx(CardDescription, { className: "text-center", children: role.description })] }), _jsx(CardContent, { children: _jsx("a", { href: role.path, children: _jsxs(Button, { className: "w-full text-base py-6", size: "lg", children: ["Open ", role.name] }) }) })] }, role.value));
                    }) }), _jsxs("div", { className: "bg-white rounded-lg shadow-md p-6 mb-6", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "\uD83D\uDCCB Presentation Flow" }), _jsxs("ol", { className: "list-decimal list-inside space-y-2 text-gray-700", children: [_jsxs("li", { children: [_jsx("strong", { children: "Admin Dashboard First" }), " - Show complete control (board members are \"control freaks\")"] }), _jsxs("li", { children: [_jsx("strong", { children: "Student Dashboard" }), " - Demonstrate the learning experience with video lessons"] }), _jsxs("li", { children: [_jsx("strong", { children: "Parent Dashboard" }), " - Show progress tracking and communication features"] }), _jsxs("li", { children: [_jsx("strong", { children: "Teacher Dashboard" }), " - Display resource management and student oversight"] })] })] }), _jsxs("div", { className: "text-center text-sm text-gray-500 bg-white rounded-lg p-4 shadow-sm", children: [_jsx("p", { className: "mb-2", children: "This demo mode allows direct access to all platform features without authentication." }), _jsx("p", { className: "text-xs text-gray-400", children: "For production, full OAuth authentication and role-based access control is implemented." })] })] }) }));
}
