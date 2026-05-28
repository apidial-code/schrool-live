import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { LayoutDashboard, Users, ClipboardList, MessageSquare, GraduationCap, BarChart3, Calendar, FolderOpen, Building2, Trophy, Settings, Menu, X, } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeacherOverview from "@/components/teacher/TeacherOverview";
import TeacherStudents from "@/components/teacher/TeacherStudents";
import TeacherAssignments from "@/components/teacher/TeacherAssignments";
import TeacherMessages from "@/components/teacher/TeacherMessages";
import TeacherTraining from "@/components/teacher/TeacherTraining";
import TeacherAnalytics from "@/components/teacher/TeacherAnalytics";
import TeacherSchedule from "@/components/teacher/TeacherSchedule";
import TeacherResources from "@/components/teacher/TeacherResources";
import TeacherSettings from "@/components/teacher/TeacherSettings";
import TeacherBankAccount from "@/components/TeacherBankAccount";
import TeacherLeaderboard from "@/components/TeacherLeaderboard";
export default function TeacherDashboard() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    const [activeSection, setActiveSection] = useState("overview");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // DEMO MODE: Allow access without authentication
    const isDemoMode = true; // Set to false to require authentication
    if (!isDemoMode && loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" }) }));
    }
    if (!isDemoMode && (!user || user.role !== "teacher")) {
        setLocation("/select-role");
        return null;
    }
    const navItems = [
        { id: "overview", label: "Dashboard", icon: LayoutDashboard },
        { id: "students", label: "My Students", icon: Users },
        { id: "assignments", label: "Assignments", icon: ClipboardList },
        { id: "messages", label: "Messages", icon: MessageSquare },
        { id: "training", label: "Training", icon: GraduationCap },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
        { id: "schedule", label: "Schedule", icon: Calendar },
        { id: "resources", label: "Resources", icon: FolderOpen },
        { id: "bank", label: "Bank Account", icon: Building2 },
        { id: "leaderboard", label: "Leaderboard", icon: Trophy },
        { id: "settings", label: "Settings", icon: Settings },
    ];
    const renderSection = () => {
        switch (activeSection) {
            case "overview":
                return _jsx(TeacherOverview, {});
            case "students":
                return _jsx(TeacherStudents, {});
            case "assignments":
                return _jsx(TeacherAssignments, {});
            case "messages":
                return _jsx(TeacherMessages, {});
            case "training":
                return _jsx(TeacherTraining, {});
            case "analytics":
                return _jsx(TeacherAnalytics, {});
            case "schedule":
                return _jsx(TeacherSchedule, {});
            case "resources":
                return _jsx(TeacherResources, {});
            case "bank":
                return _jsx(TeacherBankAccount, {});
            case "leaderboard":
                return _jsx(TeacherLeaderboard, {});
            case "settings":
                return _jsx(TeacherSettings, {});
            default:
                return _jsx(TeacherOverview, {});
        }
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsxs("aside", { className: `${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`, children: [_jsx("div", { className: "p-6 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center", children: _jsx(GraduationCap, { className: "w-6 h-6 text-white" }) }), _jsxs("div", { children: [_jsx("h1", { className: "font-bold text-lg text-gray-900", children: "SCHROOL" }), _jsx("p", { className: "text-xs text-blue-600", children: "Teacher Portal" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 space-y-1 overflow-y-auto", children: navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;
                            return (_jsxs("button", { onClick: () => setActiveSection(item.id), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                    ? "bg-blue-600 text-white shadow-lg"
                                    : "text-gray-700 hover:bg-blue-50"}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { className: "font-medium", children: item.label })] }, item.id));
                        }) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold", children: user?.name?.charAt(0).toUpperCase() || "T" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-sm text-gray-900 truncate", children: user?.name || "Demo Teacher" }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user?.email || "demo@teacher.com" })] })] }) })] }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx("header", { className: "bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setSidebarOpen(!sidebarOpen), className: "text-gray-600 hover:text-blue-600", children: sidebarOpen ? _jsx(X, { className: "w-5 h-5" }) : _jsx(Menu, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: navItems.find((item) => item.id === activeSection)?.label }), _jsx("p", { className: "text-sm text-gray-500", children: "Manage your Elite students and resources" })] })] }) }), _jsx("main", { className: "flex-1 overflow-y-auto p-6", children: renderSection() })] })] }));
}
