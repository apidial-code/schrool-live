import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Loader2, BookOpen, Trophy, LogOut, User, Menu, X, 
  Home, FileText, MessageSquare, Settings, HelpCircle, BarChart3, Zap
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LessonViewer } from "@/components/LessonViewer";
import { ImportantNotes } from "@/components/ImportantNotes";
import { AskQuestion } from "@/components/AskQuestion";
import { AchievementBadges } from "@/components/AchievementBadges";
import { LessonCertificates } from "@/components/LessonCertificates";
import { Leaderboard } from "@/components/Leaderboard";
import StudentBadges from "@/components/StudentBadges";
import { toast } from "sonner";

type DashboardView = "overview" | "lessons" | "math-lessons" | "progress" | "notes" | "questions" | "badges" | "settings" | "help";

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  
  // DEMO MODE: Allow access without authentication
  const isDemoMode = true; // Set to false to require authentication
  
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/login");
      toast.success("Logged out successfully");
    },
  });

  // Fetch lessons from direct API endpoint (workaround for Drizzle ORM issues)
  const [lessons, setLessons] = useState<any[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const { data: userProgress } = trpc.progress.getUserProgress.useQuery();
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLessonsLoading(true);
        const response = await fetch("/api/lessons/direct");
        if (response.ok) {
          const data = await response.json();
          setLessons(data);
          console.log(`[StudentDashboard] Loaded ${data.length} lessons from direct API`);
        } else {
          console.error("[StudentDashboard] Failed to fetch lessons:", response.status);
          setLessons([]);
        }
      } catch (error) {
        console.error("[StudentDashboard] Error fetching lessons:", error);
        setLessons([]);
      } finally {
        setLessonsLoading(false);
      }
    };
    
    fetchLessons();
  }, []);

  useEffect(() => {
    if (isDemoMode) return; // Skip auth check in demo mode
    
    if (loading) return;
    
    if (!user) {
      setLocation("/login");
      return;
    }

    if (user.role !== "student") {
      setLocation("/");
      return;
    }
  }, [user, loading, setLocation]);

  if (!isDemoMode && (loading || lessonsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  if (!isDemoMode && (!user || user.role !== "student")) {
    return null;
  }

  // Calculate progress statistics
  const totalLessons = lessons.length || 0;
  const completedLessons = userProgress ? userProgress.filter(p => p.completed === 1).length : 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const navigationItems = [
    { id: "overview" as DashboardView, label: "Dashboard Overview", icon: Home },
    { id: "math-lessons" as DashboardView, label: "📚 Math Lessons", icon: Zap, highlight: true },
    { id: "lessons" as DashboardView, label: "My Lessons", icon: BookOpen },
    { id: "progress" as DashboardView, label: "My Progress", icon: BarChart3 },
    { id: "notes" as DashboardView, label: "Important Notes", icon: FileText },
    { id: "questions" as DashboardView, label: "Ask a Question", icon: MessageSquare },
    { id: "badges" as DashboardView, label: "My Badges", icon: Trophy },
    { id: "settings" as DashboardView, label: "Settings", icon: Settings },
    { id: "help" as DashboardView, label: "Help & Support", icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || "Student"}!</h2>
              <p className="text-gray-600 mt-1">Continue your learning journey</p>
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("lessons")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="text-3xl font-bold text-gray-900">{totalLessons}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView("progress")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-green-600" />
                    <span className="text-3xl font-bold text-gray-900">{completedLessons}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gray-900">{progressPercentage.toFixed(0)}%</div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView("lessons")}>
                    <BookOpen className="w-6 h-6" />
                    <span>My Lessons</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView("notes")}>
                    <FileText className="w-6 h-6" />
                    <span>Important Notes</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView("questions")}>
                    <MessageSquare className="w-6 h-6" />
                    <span>Ask Question</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setCurrentView("help")}>
                    <HelpCircle className="w-6 h-6" />
                    <span>Get Help</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Lessons */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons && lessons.slice(0, 5).map((lesson, index) => {
                      const progress = userProgress?.find(p => p.lessonId === lesson.id);
                      // Check if all 3 levels have 8/10 or better
                      const isCompleted = progress && 
                        (progress.easyScore ?? 0) >= 8 && 
                        (progress.mediumScore ?? 0) >= 8 && 
                        (progress.challengingScore ?? 0) >= 8;
                      // Check if previous lesson has all 3 levels completed
                      const prevProgress = index > 0 ? userProgress?.find(p => p.lessonId === lessons[index - 1].id) : null;
                      const isPrevCompleted = prevProgress && 
                        (prevProgress.easyScore ?? 0) >= 8 && 
                        (prevProgress.mediumScore ?? 0) >= 8 && 
                        (prevProgress.challengingScore ?? 0) >= 8;
                      const isLocked = index > 0 && !isPrevCompleted;
                      
                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 border rounded-lg transition-all ${
                            isLocked
                              ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                              : isCompleted
                              ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                              : "bg-white border-gray-200 hover:shadow-md cursor-pointer"
                          }`}
                          onClick={() => !isLocked && setSelectedLesson(lesson.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {isCompleted && (
                                <Trophy className="w-5 h-5 text-green-600" />
                              )}
                              {isLocked && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {lessons && lessons.length > 5 && (
                  <Button variant="outline" className="w-full mt-4" onClick={() => setCurrentView("lessons")}>
                    View All Lessons
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "math-lessons":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-blue-600">📚 Math Lessons - Year 5-9 Excellence</h2>
              <p className="text-gray-600 mt-1">Master mathematics with interactive video lessons and exercises</p>
              <p className="text-sm text-blue-500 mt-2">✨ 18 Complete Lessons • 540 Exercises • 3 Difficulty Levels • Solution Videos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{totalLessons}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{completedLessons}</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-700">Your Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{progressPercentage.toFixed(0)}%</div>
                  <Progress value={progressPercentage} className="mt-2 h-2" />
                </CardContent>
              </Card>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-600">1️⃣ Watch Videos</div>
                    <p className="text-gray-600">Learn concepts with engaging intro videos</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-600">2️⃣ Practice Exercises</div>
                    <p className="text-gray-600">Solve 10 questions per difficulty level</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-600">3️⃣ Track Progress</div>
                    <p className="text-gray-600">Monitor your scores and unlock new lessons</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Math Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons && lessons.map((lesson, index) => {
                      const progress = userProgress?.find(p => p.lessonId === lesson.id);
                      const isCompleted = progress && 
                        (progress.easyScore ?? 0) >= 8 && 
                        (progress.mediumScore ?? 0) >= 8 && 
                        (progress.challengingScore ?? 0) >= 8;
                      const prevProgress = index > 0 ? userProgress?.find(p => p.lessonId === lessons[index - 1].id) : null;
                      const isPrevCompleted = prevProgress && 
                        (prevProgress.easyScore ?? 0) >= 8 && 
                        (prevProgress.mediumScore ?? 0) >= 8 && 
                        (prevProgress.challengingScore ?? 0) >= 8;
                      const isLocked = index > 0 && !isPrevCompleted;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 border rounded-lg transition-all ${
                            isLocked
                              ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                              : isCompleted
                              ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                              : "bg-white border-gray-200 hover:shadow-md cursor-pointer"
                          }`}
                          onClick={() => !isLocked && setSelectedLesson(lesson.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {isCompleted && (
                                <Trophy className="w-5 h-5 text-green-600" />
                              )}
                              {isLocked && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "lessons":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Lessons</h2>
              <p className="text-gray-600 mt-1">All available lessons</p>
            </div>
            <Card>
              <CardContent className="pt-6">
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons && lessons.map((lesson, index) => {
                      const progress = userProgress?.find(p => p.lessonId === lesson.id);
                      const isCompleted = progress && 
                        (progress.easyScore ?? 0) >= 8 && 
                        (progress.mediumScore ?? 0) >= 8 && 
                        (progress.challengingScore ?? 0) >= 8;
                      const prevProgress = index > 0 ? userProgress?.find(p => p.lessonId === lessons[index - 1].id) : null;
                      const isPrevCompleted = prevProgress && 
                        (prevProgress.easyScore ?? 0) >= 8 && 
                        (prevProgress.mediumScore ?? 0) >= 8 && 
                        (prevProgress.challengingScore ?? 0) >= 8;
                      const isLocked = index > 0 && !isPrevCompleted;

                      return (
                        <div
                          key={lesson.id}
                          className={`p-4 border rounded-lg transition-all ${
                            isLocked
                              ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                              : isCompleted
                              ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                              : "bg-white border-gray-200 hover:shadow-md cursor-pointer"
                          }`}
                          onClick={() => !isLocked && setSelectedLesson(lesson.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                  isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"
                                }`}>
                                  {index + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                  <p className="text-sm text-gray-600">{lesson.description}</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {isCompleted && (
                                <Trophy className="w-5 h-5 text-green-600" />
                              )}
                              {isLocked && (
                                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                  Locked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "progress":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Progress</h2>
              <p className="text-gray-600 mt-1">Overview of your learning journey</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Lessons Completed:</span>
                    <span className="text-lg font-bold text-blue-600">{completedLessons} / {totalLessons}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-right text-sm text-gray-600">{progressPercentage.toFixed(0)}% Complete</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lesson Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons && lessons.map(lesson => {
                      const progress = userProgress?.find(p => p.lessonId === lesson.id);
                      const easyScore = progress?.easyScore ?? 0;
                      const mediumScore = progress?.mediumScore ?? 0;
                      const challengingScore = progress?.challengingScore ?? 0;
                      const overallScore = (easyScore + mediumScore + challengingScore) / 3;

                      return (
                        <div key={lesson.id} className="border-b pb-4 last:border-b-0">
                          <h3 className="font-semibold text-lg text-gray-800">{lesson.title}</h3>
                          <div className="mt-2 space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span>Easy:</span>
                              <Progress value={easyScore * 10} className="w-2/3 h-2" />
                              <span className="font-medium">{easyScore}/10</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Medium:</span>
                              <Progress value={mediumScore * 10} className="w-2/3 h-2" />
                              <span className="font-medium">{mediumScore}/10</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Challenging:</span>
                              <Progress value={challengingScore * 10} className="w-2/3 h-2" />
                              <span className="font-medium">{challengingScore}/10</span>
                            </div>
                            <div className="flex justify-between items-center font-bold mt-2 pt-2 border-t">
                              <span>Overall:</span>
                              <Progress value={overallScore * 10} className="w-2/3 h-2" />
                              <span>{overallScore.toFixed(1)}/10</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "notes":
        return <ImportantNotes />;
      case "questions":
        return <AskQuestion />;
      case "badges":
        return <StudentBadges />;
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Manage your profile information here.</p>
                {/* Add form for profile settings */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Configure your notification preferences.</p>
                {/* Add form for notification settings */}
              </CardContent>
            </Card>
          </div>
        );
      case "help":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">Help & Support</h2>
            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Find answers to common questions.</p>
                {/* Add FAQ content */}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p>If you need further assistance, please contact our support team.</p>
                {/* Add contact form or details */}
              </CardContent>
            </Card>
          </div>
        );
      default:
        return (
          <div className="text-center py-10 text-gray-500">
            <p>Select an item from the sidebar to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`} style={{ width: sidebarOpen ? "280px" : "0" }}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-2xl font-bold text-blue-700">SCHROOL</h1>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start gap-3 ${item.highlight ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}`}
              onClick={() => {
                setCurrentView(item.id);
                setSidebarOpen(false);
              }}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => logout.mutate()}
          >
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-70">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold text-blue-700">SCHROOL</h1>
          <User className="h-6 w-6 text-gray-600" />
        </header>
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {selectedLesson ? (
            <LessonViewer lessonId={selectedLesson} onClose={() => setSelectedLesson(null)} />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
