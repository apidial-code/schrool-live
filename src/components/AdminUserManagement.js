import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Edit, Trash2, Plus, Eye, UserCog } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useLocation } from "wouter";
export default function AdminUserManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState();
    const { startImpersonation } = useImpersonation();
    const [, setLocation] = useLocation();
    const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery({
        role: roleFilter,
        search: searchTerm,
    });
    const deleteUserMutation = trpc.admin.deleteUser.useMutation({
        onSuccess: () => {
            refetch();
        },
    });
    const handleDeleteUser = async (userId) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteUserMutation.mutateAsync({ userId });
        }
    };
    const handleViewAs = (user) => {
        startImpersonation(user.id, user.role, user.name || user.email);
        // Navigate to appropriate dashboard
        switch (user.role) {
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
            default:
                setLocation("/");
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "User Management" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex gap-4 mb-4", children: [_jsxs("div", { className: "flex-1 relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }), _jsx(Input, { placeholder: "Search by name or email...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "pl-10" })] }), _jsxs("select", { value: roleFilter || "", onChange: (e) => setRoleFilter(e.target.value || undefined), className: "px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "", children: "All Roles" }), _jsx("option", { value: "student", children: "Students" }), _jsx("option", { value: "parent", children: "Parents" }), _jsx("option", { value: "teacher", children: "Teachers" }), _jsx("option", { value: "admin", children: "Admins" })] }), _jsxs(Button, { children: [_jsx(Plus, { className: "w-4 h-4 mr-2" }), "Create User"] })] }) })] }), _jsx(Card, { children: _jsx(CardContent, { className: "p-0", children: isLoading ? (_jsx("div", { className: "text-center py-8", children: "Loading users..." })) : !users || users.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No users found" })) : (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Role" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Joined" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase", children: "Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "font-medium text-gray-900", children: user.name || "N/A" }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: user.email || "N/A" }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-red-100 text-red-800" :
                                                        user.role === "teacher" ? "bg-purple-100 text-purple-800" :
                                                            user.role === "parent" ? "bg-blue-100 text-blue-800" :
                                                                "bg-green-100 text-green-800"}`, children: user.role }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: new Date(user.createdAt).toLocaleDateString() }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsxs("div", { className: "flex gap-2 justify-end", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleViewAs(user), title: "View as this user", children: _jsx(UserCog, { className: "w-4 h-4 text-blue-600" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Eye, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Edit, { className: "w-4 h-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteUser(user.id), disabled: deleteUserMutation.isPending, children: _jsx(Trash2, { className: "w-4 h-4 text-red-600" }) })] }) })] }, user.id))) })] }) })) }) })] }));
}
