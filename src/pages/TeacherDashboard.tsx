import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
  GraduationCap,
  BarChart3,
  Calendar,
  FolderOpen,
  Building2,
  Trophy,
  Settings,
  Menu,
  X,
} from "lucide-react";
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

type Section =
  | "overview"
  | "students"
  | "assignments"
  | "messages"
  | "training"
  | "analytics"
  | "schedule"
  | "resources"
  | "bank"
  | "leaderboard"
  | "settings";

export default function TeacherDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // DEMO MODE: Allow access without authentication
  const isDemoMode = true; // Set to false to require authentication

  if (!isDemoMode && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isDemoMode && (!user || user.role !== "teacher")) {
    setLocation("/select-role");
    return null;
  }

  const navItems = [
    { id: "overview" as Section, label: "Dashboard", icon: LayoutDashboard },
    { id: "students" as Section, label: "My Students", icon: Users },
    { id: "assignments" as Section, label: "Assignments", icon: ClipboardList },
    { id: "messages" as Section, label: "Messages", icon: MessageSquare },
    { id: "training" as Section, label: "Training", icon: GraduationCap },
    { id: "analytics" as Section, label: "Analytics", icon: BarChart3 },
    { id: "schedule" as Section, label: "Schedule", icon: Calendar },
    { id: "resources" as Section, label: "Resources", icon: FolderOpen },
    { id: "bank" as Section, label: "Bank Account", icon: Building2 },
    { id: "leaderboard" as Section, label: "Leaderboard", icon: Trophy },
    { id: "settings" as Section, label: "Settings", icon: Settings },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <TeacherOverview />;
      case "students":
        return <TeacherStudents />;
      case "assignments":
        return <TeacherAssignments />;
      case "messages":
        return <TeacherMessages />;
      case "training":
        return <TeacherTraining />;
      case "analytics":
        return <TeacherAnalytics />;
      case "schedule":
        return <TeacherSchedule />;
      case "resources":
        return <TeacherResources />;
      case "bank":
        return <TeacherBankAccount />;
      case "leaderboard":
        return <TeacherLeaderboard />;
      case "settings":
        return <TeacherSettings />;
      default:
        return <TeacherOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-900">SCHROOL</h1>
              <p className="text-xs text-blue-600">Teacher Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
              {user?.name?.charAt(0).toUpperCase() || "T"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{user?.name || "Demo Teacher"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "demo@teacher.com"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 hover:text-blue-600"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-gray-500">Manage your Elite students and resources</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderSection()}</main>
      </div>
    </div>
  );
}
