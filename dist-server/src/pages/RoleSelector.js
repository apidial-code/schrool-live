import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
export default function RoleSelector() {
    const [, setLocation] = useLocation();
    const { data: user } = trpc.auth.me.useQuery();
    const updateRole = trpc.auth.updateRole.useMutation({
        onSuccess: (data) => {
            toast.success(`Role updated to ${data.role}`);
            // Redirect based on role
            switch (data.role) {
                case "student":
                    setLocation("/student");
                    break;
                case "parent":
                    setLocation("/parent");
                    break;
                case "teacher":
                    setLocation("/teacher");
                    break;
                case "admin":
                    setLocation("/admin");
                    break;
            }
        },
        onError: (error) => {
            toast.error(`Failed to update role: ${error.message}`);
        },
    });
    const roles = [
        {
            value: "student",
            name: "Student",
            description: "Access your lessons and track your progress",
            icon: GraduationCap,
            color: "bg-blue-500",
        },
        {
            value: "parent",
            name: "Parent",
            description: "Monitor your child's learning journey",
            icon: Users,
            color: "bg-green-500",
        },
        {
            value: "teacher",
            name: "Teacher",
            description: "Manage students and resources",
            icon: BookOpen,
            color: "bg-purple-500",
        },
        {
            value: "admin",
            name: "Admin",
            description: "System administration and analytics",
            icon: Shield,
            color: "bg-red-500",
        },
    ];
    if (!user) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("p", { children: "Loading..." }) }));
    }
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4", children: _jsxs("div", { className: "w-full max-w-5xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: ["Welcome, ", user.name, "!"] }), _jsx("p", { className: "text-lg text-gray-600", children: "Please select your role to continue" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: roles.map((role) => (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsxs(CardHeader, { children: [_jsx("div", { className: `w-12 h-12 rounded-full ${role.color} flex items-center justify-center mb-3`, children: _jsx(role.icon, { className: "w-6 h-6 text-white" }) }), _jsx(CardTitle, { children: role.name }), _jsx(CardDescription, { children: role.description })] }), _jsx(CardContent, { children: _jsx(Button, { className: "w-full", onClick: () => updateRole.mutate({ role: role.value }), disabled: updateRole.isPending, children: updateRole.isPending ? "Updating..." : `Continue as ${role.name}` }) })] }, role.value))) })] }) }));
}
