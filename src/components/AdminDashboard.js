import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { LayoutDashboard, Users, Eye, Award, MessageSquare, DollarSign, BarChart3, BookOpen, FileText, Settings, Menu, X, LogOut, Shield } from "lucide-react";
import AdminOverview from "./AdminOverview";
import AdminUserManagement from "./AdminUserManagement";
import AdminTeacherPayments from "./AdminTeacherPayments";
import AdminMessaging from "./AdminMessaging";
import AdminAnalyticsEnhanced from "./AdminAnalyticsEnhanced";
import PaymentReportDownload from "./PaymentReportDownload";
import ImpersonationAuditLog from "./ImpersonationAuditLog";
import EmailAutomation from "./EmailAutomation";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
export default function AdminDashboard() {
    const { user } = useAuth();
    const [, setLocation] = useLocation();
    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const logoutMutation = trpc.auth.logout.useMutation();
    const handleLogout = async () => {
        await logoutMutation.mutateAsync();
        setLocation("/login");
    };
    // DEMO MODE: Removed auth check to allow demo access
    // if (!user || user.role !== "admin") {
    //   return (
    //     <div className="min-h-screen flex items-center justify-center bg-gray-50">
    //       <div className="text-center">
    //         <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
    //         <p className="text-gray-600">You must be an admin to access this dashboard.</p>
    //       </div>
    //     </div>
    //   );
    // }
    const sections = [
        { id: "overview", label: "Dashboard Overview", icon: LayoutDashboard },
        { id: "users", label: "User Management", icon: Users },
        { id: "dashboard-access", label: "Dashboard Access", icon: Eye },
        { id: "teacher-certification", label: "Teacher Certification", icon: Award },
        { id: "messaging", label: "Messaging Center", icon: MessageSquare },
        { id: "payments", label: "Teacher Payments", icon: DollarSign },
        { id: "analytics", label: "System Analytics", icon: BarChart3 },
        { id: "courses", label: "Course Management", icon: BookOpen },
        { id: "enrollments", label: "Enrollments", icon: FileText },
        { id: "audit", label: "Audit Log", icon: Shield },
        { id: "email-automation", label: "Email Automation", icon: MessageSquare },
        { id: "settings", label: "Settings", icon: Settings },
    ];
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex", children: [_jsxs("div", { className: `${sidebarOpen ? "w-64" : "w-0"} bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 overflow-hidden flex flex-col`, children: [_jsxs("div", { className: "p-6 border-b border-blue-500", children: [_jsx("h1", { className: "text-2xl font-bold", children: "SCHROOL Admin" }), _jsx("p", { className: "text-blue-200 text-sm mt-1", children: "Control Center" })] }), _jsx("nav", { className: "flex-1 p-4 overflow-y-auto", children: sections.map((section) => {
                            const Icon = section.icon;
                            return (_jsxs("button", { onClick: () => setActiveSection(section.id), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${activeSection === section.id
                                    ? "bg-blue-700 text-white"
                                    : "text-blue-100 hover:bg-blue-700/50"}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: section.label })] }, section.id));
                        }) }), _jsxs("div", { className: "p-4 border-t border-blue-500", children: [_jsxs("div", { className: "flex items-center gap-3 mb-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center", children: _jsx("span", { className: "text-lg font-bold", children: user?.name?.[0] || "A" }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: user?.name || "Demo Admin" }), _jsx("p", { className: "text-xs text-blue-200", children: "Administrator" })] })] }), _jsxs(Button, { variant: "outline", className: "w-full bg-transparent border-blue-400 text-white hover:bg-blue-700", onClick: handleLogout, children: [_jsx(LogOut, { className: "w-4 h-4 mr-2" }), "Logout"] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("header", { className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "p-2 hover:bg-gray-100 rounded-lg", children: sidebarOpen ? _jsx(X, { className: "w-6 h-6" }) : _jsx(Menu, { className: "w-6 h-6" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: sections.find((s) => s.id === activeSection)?.label })] }) }), _jsxs("main", { className: "flex-1 p-6 overflow-y-auto", children: [activeSection === "overview" && _jsx(AdminOverview, {}), activeSection === "users" && _jsx(AdminUserManagement, {}), activeSection === "dashboard-access" && (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsx("h3", { className: "text-xl font-bold mb-4", children: "Dashboard Access Control" }), _jsx("p", { className: "text-gray-600 mb-4", children: "View and control student, parent, and teacher dashboards from here." }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Student Dashboards" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Access any student's dashboard" }), _jsx(Button, { variant: "outline", className: "w-full", children: "View Students" })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Parent Dashboards" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Access any parent's dashboard" }), _jsx(Button, { variant: "outline", className: "w-full", children: "View Parents" })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold mb-2", children: "Teacher Dashboards" }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Access any teacher's dashboard" }), _jsx(Button, { variant: "outline", className: "w-full", children: "View Teachers" })] })] })] })), activeSection === "teacher-certification" && (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsx("h3", { className: "text-xl font-bold mb-4", children: "Teacher Certification Management" }), _jsx("p", { className: "text-gray-600", children: "Approve/reject teacher applications, verify documents, and manage certifications." }), _jsx("div", { className: "mt-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Feature coming soon..." }) })] })), activeSection === "messaging" && _jsx(AdminMessaging, {}), activeSection === "payments" && (_jsxs("div", { className: "space-y-6", children: [_jsx(AdminTeacherPayments, {}), _jsx(PaymentReportDownload, {})] })), activeSection === "analytics" && _jsx(AdminAnalyticsEnhanced, {}), activeSection === "courses" && (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsx("h3", { className: "text-xl font-bold mb-4", children: "Course Management" }), _jsx("p", { className: "text-gray-600", children: "Manage courses, lessons, and exercises for all year levels." }), _jsx("div", { className: "mt-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Feature coming soon..." }) })] })), activeSection === "enrollments" && (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsx("h3", { className: "text-xl font-bold mb-4", children: "Enrollment Management" }), _jsx("p", { className: "text-gray-600", children: "View and manage all student enrollments and payment status." }), _jsx("div", { className: "mt-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Feature coming soon..." }) })] })), activeSection === "audit" && _jsx(ImpersonationAuditLog, {}), activeSection === "email-automation" && _jsx(EmailAutomation, {}), activeSection === "settings" && (_jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [_jsx("h3", { className: "text-xl font-bold mb-4", children: "System Settings" }), _jsx("p", { className: "text-gray-600", children: "Configure system settings, integrations, and platform preferences." }), _jsx("div", { className: "mt-6", children: _jsx("p", { className: "text-sm text-gray-500", children: "Feature coming soon..." }) })] }))] })] })] }));
}
