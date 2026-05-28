import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
import { useLocation } from "wouter";
export default function DemoRoleSelector() {
    const [, setLocation] = useLocation();
    const roles = [
        {
            value: "student",
            name: "Student",
            description: "Access your lessons and track your progress",
            icon: GraduationCap,
            color: "bg-blue-500",
            path: "/student",
        },
        {
            value: "parent",
            name: "Parent",
            description: "Monitor your child's learning journey",
            icon: Users,
            color: "bg-green-500",
            path: "/parent",
        },
        {
            value: "teacher",
            name: "Teacher",
            description: "Manage students and resources",
            icon: BookOpen,
            color: "bg-purple-500",
            path: "/teacher",
        },
        {
            value: "admin",
            name: "Admin",
            description: "System administration and analytics",
            icon: Shield,
            color: "bg-red-500",
            path: "/admin",
        },
    ];
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "w-full max-w-6xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "SCHROOL Learning Platform" }), _jsx("p", { className: "text-lg text-gray-600", children: "Year 7 Mathematics Excellence" }), _jsx("p", { className: "text-sm text-orange-600 font-semibold mt-2", children: "DEMO MODE - No Authentication Required" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: roles.map((role) => {
                        const Icon = role.icon;
                        return (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: `w-12 h-12 ${role.color} rounded-full flex items-center justify-center mb-4`, children: _jsx(Icon, { className: "h-6 w-6 text-white" }) }), _jsx(CardTitle, { children: role.name }), _jsx(CardDescription, { children: role.description })] }), _jsx(CardContent, { children: _jsxs(Button, { className: "w-full", onClick: () => setLocation(role.path), children: ["Continue as ", role.name] }) })] }, role.value));
                    }) }), _jsx("div", { className: "mt-8 text-center text-sm text-gray-500", children: _jsx("p", { children: "Demo mode allows direct access to all dashboards without authentication" }) })] }) }));
}
