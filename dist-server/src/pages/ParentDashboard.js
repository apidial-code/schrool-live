import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, LogOut, Menu, X, Home, ClipboardList, TrendingUp, Lightbulb, Trophy, Calendar, Mail, Bell, Settings as SettingsIcon } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ParentOverview } from "@/components/parent/ParentOverview";
import { ParentAssignments } from "@/components/parent/ParentAssignments";
import { ParentProgress } from "@/components/parent/ParentProgress";
import { ParentInfo } from "@/components/parent/ParentInfo";
import { ParentAchievements } from "@/components/parent/ParentAchievements";
import { ParentSchedule } from "@/components/parent/ParentSchedule";
import { ParentMessages } from "@/components/parent/ParentMessages";
import { ParentSettings } from "@/components/parent/ParentSettings";
import ParentNotifications from "@/components/ParentNotifications";
import { useState, useEffect } from "react";
export default function ParentDashboard() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState("overview");
    // DEMO MODE: Allow access without authentication
    const isDemoMode = true;
    const logout = trpc.auth.logout.useMutation({
        onSuccess: () => {
            setLocation("/login");
            toast.success("Logged out successfully");
        },
    });
    // Fetch children using direct API
    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Fetch children on component mount
    useEffect(() => {
        const fetchChildren = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/parent/direct/children?parentEmail=parent@schrool.com');
                if (!response.ok)
                    throw new Error('Failed to fetch children');
                const data = await response.json();
                setChildren(data || []);
                // Auto-select first child
                if (data && data.length > 0) {
                    setSelectedChildId(data[0].id);
                }
            }
            catch (error) {
                console.error('[ParentDashboard] Error:', error);
                toast.error('Failed to load children');
                setChildren([]);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchChildren();
    }, []);
    // Auth check
    useEffect(() => {
        if (isDemoMode)
            return;
        if (loading)
            return;
        if (!user) {
            setLocation("/login");
            return;
        }
        if (user.role !== "parent") {
            setLocation("/");
            return;
        }
    }, [user, loading, setLocation]);
    // Get selected child safely
    const selectedChild = children.find(c => c.id === selectedChildId) || children[0];
    // Show loading state
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-700" }) }));
    }
    // Show no children message
    if (!children || children.length === 0) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100", children: _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "No Children Linked" }), _jsx("p", { className: "text-gray-600 mb-6", children: "Please contact support to link your child's account." }), _jsxs(Button, { onClick: () => logout.mutate(), children: [_jsx(LogOut, { className: "w-4 h-4 mr-2" }), "Logout"] })] }) }));
    }
    // Navigation items
    const navigationItems = [
        { id: "overview", label: "Overview", icon: Home },
        { id: "assignments", label: `${selectedChild?.name || 'Child'}'s Assignments`, icon: ClipboardList },
        { id: "progress", label: "Progress Tracking", icon: TrendingUp },
        { id: "info", label: "5QHackMath Info", icon: Lightbulb },
        { id: "achievements", label: "Achievements", icon: Trophy },
        { id: "schedule", label: "Schedule & Sessions", icon: Calendar },
        { id: "messages", label: "Teacher Messages", icon: Mail, badge: 0 },
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: SettingsIcon },
    ];
    // Render content based on current view
    const renderContent = () => {
        if (!selectedChildId)
            return null;
        switch (currentView) {
            case "overview":
                return _jsx(ParentOverview, { studentId: selectedChildId, studentName: selectedChild?.name || "" });
            case "assignments":
                return _jsx(ParentAssignments, { studentId: selectedChildId, studentName: selectedChild?.name || "" });
            case "progress":
                return _jsx(ParentProgress, { studentId: selectedChildId, studentName: selectedChild?.name || "" });
            case "info":
                return _jsx(ParentInfo, {});
            case "achievements":
                return _jsx(ParentAchievements, { studentId: selectedChildId, studentName: selectedChild?.name || "" });
            case "schedule":
                return _jsx(ParentSchedule, { studentId: selectedChildId, studentName: selectedChild?.name || "" });
            case "messages":
                return _jsx(ParentMessages, { studentId: selectedChildId });
            case "notifications":
                return _jsx(ParentNotifications, {});
            case "settings":
                return _jsx(ParentSettings, {});
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsxs("div", { className: `${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`, children: [_jsxs("div", { className: "p-4 border-b border-gray-200 flex items-center justify-between", children: [_jsx("h1", { className: `font-bold text-lg text-blue-700 ${!sidebarOpen && 'hidden'}`, children: "SCHROOL" }), _jsx("button", { onClick: () => setSidebarOpen(!sidebarOpen), className: "p-2 hover:bg-gray-100 rounded-lg", children: sidebarOpen ? _jsx(X, { size: 20 }) : _jsx(Menu, { size: 20 }) })] }), sidebarOpen && (_jsxs("div", { className: "p-4 border-b border-gray-200", children: [_jsx("label", { className: "text-xs font-semibold text-gray-600 block mb-2", children: "SELECT CHILD" }), _jsx("select", { value: selectedChildId || '', onChange: (e) => setSelectedChildId(Number(e.target.value)), className: "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm", children: children.map(child => (_jsx("option", { value: child.id, children: child.name }, child.id))) })] })), _jsx("nav", { className: "flex-1 p-4 space-y-2", children: navigationItems.map(item => (_jsxs("button", { onClick: () => setCurrentView(item.id), className: `w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${currentView === item.id
                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                : 'text-gray-700 hover:bg-gray-100'}`, children: [_jsx(item.icon, { size: 20 }), sidebarOpen && (_jsxs("div", { className: "flex items-center justify-between flex-1", children: [_jsx("span", { children: item.label }), item.badge ? _jsx("span", { className: "bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center", children: item.badge }) : null] }))] }, item.id))) }), _jsx("div", { className: "p-4 border-t border-gray-200", children: _jsxs("button", { onClick: () => logout.mutate(), className: "w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors", children: [_jsx(LogOut, { size: 20 }), sidebarOpen && _jsx("span", { children: "Logout" })] }) })] }), _jsx("div", { className: "flex-1 overflow-auto", children: _jsx("div", { className: "p-8", children: renderContent() }) })] }));
}
