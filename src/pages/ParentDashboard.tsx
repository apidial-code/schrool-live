import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Loader2, LogOut, User, Menu, X, Home, ClipboardList, TrendingUp,
  Lightbulb, Trophy, Calendar, Mail, Bell, Settings as SettingsIcon
} from "lucide-react";
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

type DashboardView = "overview" | "assignments" | "progress" | "info" | "achievements" | "schedule" | "messages" | "notifications" | "settings";

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  
  // DEMO MODE: Allow access without authentication
  const isDemoMode = true;
  
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/login");
      toast.success("Logged out successfully");
    },
  });

  // Fetch children using direct API
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/parent/direct/children?parentEmail=parent@schrool.com');
        if (!response.ok) throw new Error('Failed to fetch children');
        const data = await response.json();
        setChildren(data || []);
        // Auto-select first child
        if (data && data.length > 0) {
          setSelectedChildId(data[0].id);
        }
      } catch (error) {
        console.error('[ParentDashboard] Error:', error);
        toast.error('Failed to load children');
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChildren();
  }, []);

  // Auth check
  useEffect(() => {
    if (isDemoMode) return;
    if (loading) return;
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  // Show no children message
  if (!children || children.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Children Linked</h2>
          <p className="text-gray-600 mb-6">Please contact support to link your child's account.</p>
          <Button onClick={() => logout.mutate()}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // Navigation items
  const navigationItems = [
    { id: "overview" as DashboardView, label: "Overview", icon: Home },
    { id: "assignments" as DashboardView, label: `${selectedChild?.name || 'Child'}'s Assignments`, icon: ClipboardList },
    { id: "progress" as DashboardView, label: "Progress Tracking", icon: TrendingUp },
    { id: "info" as DashboardView, label: "5QHackMath Info", icon: Lightbulb },
    { id: "achievements" as DashboardView, label: "Achievements", icon: Trophy },
    { id: "schedule" as DashboardView, label: "Schedule & Sessions", icon: Calendar },
    { id: "messages" as DashboardView, label: "Teacher Messages", icon: Mail, badge: 0 },
    { id: "notifications" as DashboardView, label: "Notifications", icon: Bell },
    { id: "settings" as DashboardView, label: "Settings", icon: SettingsIcon },
  ];

  // Render content based on current view
  const renderContent = () => {
    if (!selectedChildId) return null;

    switch (currentView) {
      case "overview":
        return <ParentOverview studentId={selectedChildId} studentName={selectedChild?.name || ""} />;
      case "assignments":
        return <ParentAssignments studentId={selectedChildId} studentName={selectedChild?.name || ""} />;
      case "progress":
        return <ParentProgress studentId={selectedChildId} studentName={selectedChild?.name || ""} />;
      case "info":
        return <ParentInfo />;
      case "achievements":
        return <ParentAchievements studentId={selectedChildId} studentName={selectedChild?.name || ""} />;
      case "schedule":
        return <ParentSchedule studentId={selectedChildId} studentName={selectedChild?.name || ""} />;
      case "messages":
        return <ParentMessages studentId={selectedChildId} />;
      case "notifications":
        return <ParentNotifications />;
      case "settings":
        return <ParentSettings />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h1 className={`font-bold text-lg text-blue-700 ${!sidebarOpen && 'hidden'}`}>SCHROOL</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Child Selector */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-200">
            <label className="text-xs font-semibold text-gray-600 block mb-2">SELECT CHILD</label>
            <select
              value={selectedChildId || ''}
              onChange={(e) => setSelectedChildId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-blue-100 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.badge ? <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{item.badge}</span> : null}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
