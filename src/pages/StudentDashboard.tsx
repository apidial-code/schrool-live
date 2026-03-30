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
        const response = await fetch('/api/lessons/direct');
        if (response.ok) {
          const data = await response.json();
          setLessons(data);
          console.log(`[StudentDashboard] Loaded ${data.length} lessons from direct API`);
        } else {
          console.error('[StudentDashboard] Failed to fetch lessons:', response.status);
          setLessons([]);
        }
      } catch (error) {
        console.error('[StudentDashboard] Error fetching lessons:', error);
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
  const totalLessons = lessons?.length || 0;
  const completedLessons = userProgress?.filter(p => p.completed === 1).length || 0;
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
                {!lessons || lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.slice(0, 5).map((lesson, index) => {
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
                    <p className="text-gray-600">Solve 10 questions at each difficulty level</p>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold text-blue-600">3️⃣ Score 8/10 to Progress</div>
                    <p className="text-gray-600">Unlock next level when you reach 8 correct</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Math Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                {!lessons || lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-blue-50"
                        onClick={() => setSelectedLesson(lesson.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                            <div className="flex gap-2 mt-3">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Easy</span>
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">Medium</span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Challenging</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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
              <p className="text-gray-600 mt-1">Click on a lesson to start learning</p>
            </div>

            <Card>
              <CardContent className="pt-6">
                {!lessons || lessons.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No lessons available yet. Check back soon!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lessons.map((lesson, index) => {
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
                              {progress && (
                                <div className="text-sm text-gray-600">
                                  {progress.correctAnswers}/{progress.totalAttempts} correct
                                </div>
                              )}
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
              <p className="text-gray-600 mt-1">Track your learning journey</p>
            </div>

            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Lessons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{totalLessons}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{completedLessons}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{totalLessons - completedLessons}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700">{progressPercentage.toFixed(0)}%</div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Lesson by Lesson Progress</CardTitle>
                <CardDescription>See your performance on each lesson</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lessons?.map((lesson, index) => {
                    const progress = userProgress?.find(p => p.lessonId === lesson.id);
                    // Check if all 3 levels have 8/10 or better
                    const isCompleted = progress && 
                      (progress.easyScore ?? 0) >= 8 && 
                      (progress.mediumScore ?? 0) >= 8 && 
                      (progress.challengingScore ?? 0) >= 8;
                    
                    return (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                              isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"
                            }`}>
                              {index + 1}
                            </div>
                            <h4 className="font-semibold text-gray-900">{lesson.title}</h4>
                          </div>
                          {isCompleted && <Trophy className="w-5 h-5 text-green-600" />}
                        </div>
                        
                        {progress && (
                          <div className="space-y-2 ml-11">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Easy Level:</span>
                              <span className="font-medium">{progress.easyScore || 0}/10 {progress.easyCompleted ? "✓" : ""}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Medium Level:</span>
                              <span className="font-medium">{progress.mediumScore || 0}/10 {progress.mediumCompleted ? "✓" : ""}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Challenging Level:</span>
                              <span className="font-medium">{progress.challengingScore || 0}/10 {progress.challengingCompleted ? "✓" : ""}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600 mt-1">Manage your account preferences</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900 mt-1">{user?.name || "Demo Student"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{user?.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="text-gray-900 mt-1 capitalize">{user?.role || "student"}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Notification settings will be available soon.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Display customization options will be available soon.</p>
              </CardContent>
            </Card>
          </div>
        );

      case "help":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Help & Support</h2>
              <p className="text-gray-600 mt-1">Get assistance when you need it</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Reach out to our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Phone Tutor</h4>
                  <a href="tel:+61499989179" className="text-blue-600 hover:underline text-lg font-medium">
                    +61 499 989 179
                  </a>
                  <p className="text-sm text-gray-500 mt-1">
                    (Will be replaced with 1800 number at launch)
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Email Support</h4>
                  <a href="mailto:support@schrool.com" className="text-blue-600 hover:underline">
                    support@schrool.com
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">How do I unlock the next lesson?</h4>
                  <p className="text-gray-600 text-sm">
                    Complete all three difficulty levels (Easy, Medium, Challenging) of the current lesson with at least 8/10 correct answers in each level.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Can I watch solution videos?</h4>
                  <p className="text-gray-600 text-sm">
                    Yes! Solution videos are always available. However, questions where you watched the solution won't count toward your final score.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">What is the 8/10 rule?</h4>
                  <p className="text-gray-600 text-sm">
                    You need to answer at least 8 out of 10 questions correctly (without watching solutions) to progress to the next difficulty level or lesson.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tutorial Videos</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Tutorial videos will be available soon to help you navigate the platform.</p>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0"} lg:w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 overflow-hidden fixed lg:relative h-screen z-20`}>
        <div className="p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">SCHROOL</h1>
            <p className="text-sm text-blue-200 mt-1">Student Portal</p>
          </div>

          <div className="mb-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || "S"}
            </div>
            <p className="font-semibold">{user?.name || "Demo Student"}</p>
            <p className="text-sm text-blue-200">Student</p>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentView === item.id
                      ? "bg-white text-blue-600 shadow-lg"
                      : "text-white hover:bg-blue-700"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
              <div className="flex-1 lg:hidden" />
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user?.name || "Demo Student"}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {renderContent()}
        </main>
      </div>

      {/* Lesson Viewer Modal */}
      {selectedLesson && (
        <LessonViewer
          lessonId={selectedLesson}
          onClose={() => setSelectedLesson(null)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
