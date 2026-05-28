import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
export default function Login() {
    const roles = [
        {
            name: "Student",
            description: "Access your lessons and track your progress",
            icon: GraduationCap,
            color: "bg-blue-500",
        },
        {
            name: "Parent",
            description: "Monitor your child's learning journey",
            icon: Users,
            color: "bg-green-500",
        },
        {
            name: "Teacher",
            description: "Manage students and resources",
            icon: BookOpen,
            color: "bg-purple-500",
        },
        {
            name: "Admin",
            description: "System administration and analytics",
            icon: Shield,
            color: "bg-red-500",
        },
    ];
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "w-full max-w-5xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "SCHROOL Learning Platform" }), _jsx("p", { className: "text-lg text-gray-600", children: "Year 7 Mathematics Excellence" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: roles.map((role) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: `w-12 h-12 rounded-full ${role.color} flex items-center justify-center mb-3`, children: _jsx(role.icon, { className: "w-6 h-6 text-white" }) }), _jsx(CardTitle, { children: role.name }), _jsx(CardDescription, { children: role.description })] }), _jsx(CardContent, { children: _jsxs(Button, { className: "w-full", onClick: () => {
                                        window.location.href = getLoginUrl();
                                    }, children: ["Login as ", role.name] }) })] }, role.name))) }), _jsx("div", { className: "mt-8 text-center text-sm text-gray-600", children: _jsx("p", { children: "Secure authentication powered by GitHub" }) })] }) }));
}
