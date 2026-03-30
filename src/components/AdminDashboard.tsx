import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  Award, 
  MessageSquare, 
  DollarSign, 
  BarChart3, 
  BookOpen,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  Shield
} from "lucide-react";
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

type Section = 
  | "overview" 
  | "users" 
  | "dashboard-access" 
  | "teacher-certification" 
  | "messaging" 
  | "payments" 
  | "analytics" 
  | "courses"
  | "enrollments"
  | "audit"
  | "email-automation"
  | "settings";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>("overview");
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-blue-500">
          <h1 className="text-2xl font-bold">SCHROOL Admin</h1>
          <p className="text-blue-200 text-sm mt-1">Control Center</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as Section)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-lg font-bold">{user?.name?.[0] || "A"}</span>
            </div>
            <div>
              <p className="font-medium">{user?.name || "Demo Admin"}</p>
              <p className="text-xs text-blue-200">Administrator</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent border-blue-400 text-white hover:bg-blue-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              {sections.find((s) => s.id === activeSection)?.label}
            </h2>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === "overview" && <AdminOverview />}
          {activeSection === "users" && <AdminUserManagement />}
          {activeSection === "dashboard-access" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Dashboard Access Control</h3>
              <p className="text-gray-600 mb-4">
                View and control student, parent, and teacher dashboards from here.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Student Dashboards</h4>
                  <p className="text-sm text-gray-600 mb-3">Access any student's dashboard</p>
                  <Button variant="outline" className="w-full">View Students</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Parent Dashboards</h4>
                  <p className="text-sm text-gray-600 mb-3">Access any parent's dashboard</p>
                  <Button variant="outline" className="w-full">View Parents</Button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Teacher Dashboards</h4>
                  <p className="text-sm text-gray-600 mb-3">Access any teacher's dashboard</p>
                  <Button variant="outline" className="w-full">View Teachers</Button>
                </div>
              </div>
            </div>
          )}
          {activeSection === "teacher-certification" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Teacher Certification Management</h3>
              <p className="text-gray-600">
                Approve/reject teacher applications, verify documents, and manage certifications.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Feature coming soon...</p>
              </div>
            </div>
          )}
          {activeSection === "messaging" && <AdminMessaging />}
          {activeSection === "payments" && (
            <div className="space-y-6">
              <AdminTeacherPayments />
              <PaymentReportDownload />
            </div>
          )}
          {activeSection === "analytics" && <AdminAnalyticsEnhanced />}
          {activeSection === "courses" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Course Management</h3>
              <p className="text-gray-600">
                Manage courses, lessons, and exercises for all year levels.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Feature coming soon...</p>
              </div>
            </div>
          )}
          {activeSection === "enrollments" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Enrollment Management</h3>
              <p className="text-gray-600">
                View and manage all student enrollments and payment status.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Feature coming soon...</p>
              </div>
            </div>
          )}
          {activeSection === "audit" && <ImpersonationAuditLog />}
          {activeSection === "email-automation" && <EmailAutomation />}
          {activeSection === "settings" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">System Settings</h3>
              <p className="text-gray-600">
                Configure system settings, integrations, and platform preferences.
              </p>
              <div className="mt-6">
                <p className="text-sm text-gray-500">Feature coming soon...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
