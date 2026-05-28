import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Loader2, BookOpen, Trophy, LogOut, User, Menu, X, Home, FileText, MessageSquare, Settings, HelpCircle, BarChart3, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LessonViewer } from "@/components/LessonViewer";
import { ImportantNotes } from "@/components/ImportantNotes";
import { AskQuestion } from "@/components/AskQuestion";
import StudentBadges from "@/components/StudentBadges";
import { toast } from "sonner";
export default function StudentDashboard() {
    const { user, loading } = useAuth();
    const [, setLocation] = useLocation();
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentView, setCurrentView] = useState("overview");
    // DEMO MODE: Allow access without authentication
    const isDemoMode = true; // Set to false to require authentication
    const logout = trpc.auth.logout.useMutation({
        onSuccess: () => {
            setLocation("/login");
            toast.success("Logged out successfully");
        },
    });
    // Fetch lessons from direct API endpoint (workaround for Drizzle ORM issues)
    const [lessons, setLessons] = useState([]);
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
                }
                else {
                    console.error('[StudentDashboard] Failed to fetch lessons:', response.status);
                    setLessons([]);
                }
            }
            catch (error) {
                console.error('[StudentDashboard] Error fetching lessons:', error);
                setLessons([]);
            }
            finally {
                setLessonsLoading(false);
            }
        };
        fetchLessons();
    }, []);
    useEffect(() => {
        if (isDemoMode)
            return; // Skip auth check in demo mode
        if (loading)
            return;
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-600" }) }));
    }
    if (!isDemoMode && (!user || user.role !== "student")) {
        return null;
    }
    // Calculate progress statistics
    const totalLessons = lessons?.length || 0;
    const completedLessons = userProgress?.filter(p => p.completed === 1).length || 0;
    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
    const navigationItems = [
        { id: "overview", label: "Dashboard Overview", icon: Home },
        { id: "math-lessons", label: "📚 Math Lessons", icon: Zap, highlight: true },
        { id: "lessons", label: "My Lessons", icon: BookOpen },
        { id: "progress", label: "My Progress", icon: BarChart3 },
        { id: "notes", label: "Important Notes", icon: FileText },
        { id: "questions", label: "Ask a Question", icon: MessageSquare },
        { id: "badges", label: "My Badges", icon: Trophy },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "help", label: "Help & Support", icon: HelpCircle },
    ];
    const renderContent = () => {
        switch (currentView) {
            case "overview":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900", children: ["Welcome back, ", user?.name || "Student", "!"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Continue your learning journey" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setCurrentView("lessons"), children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Lessons" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: totalLessons })] }) })] }), _jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setCurrentView("progress"), children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Completed" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: completedLessons })] }) })] }), _jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [progressPercentage.toFixed(0), "%"] }), _jsx(Progress, { value: progressPercentage, className: "h-2" })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Actions" }), _jsx(CardDescription, { children: "Jump to your most used features" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("lessons"), children: [_jsx(BookOpen, { className: "w-6 h-6" }), _jsx("span", { children: "My Lessons" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("notes"), children: [_jsx(FileText, { className: "w-6 h-6" }), _jsx("span", { children: "Important Notes" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("questions"), children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { children: "Ask Question" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("help"), children: [_jsx(HelpCircle, { className: "w-6 h-6" }), _jsx("span", { children: "Get Help" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Continue Learning" }), _jsx(CardDescription, { children: "Pick up where you left off" })] }), _jsxs(CardContent, { children: [!lessons || lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "space-y-3", children: lessons.slice(0, 5).map((lesson, index) => {
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
                                                return (_jsx("div", { className: `p-4 border rounded-lg transition-all ${isLocked
                                                        ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                                                        : isCompleted
                                                            ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                                                            : "bg-white border-gray-200 hover:shadow-md cursor-pointer"}`, onClick: () => !isLocked && setSelectedLesson(lesson.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`, children: index + 1 }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600", children: lesson.description })] })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [isCompleted && (_jsx(Trophy, { className: "w-5 h-5 text-green-600" })), isLocked && (_jsx("span", { className: "text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded", children: "Locked" }))] })] }) }, lesson.id));
                                            }) })), lessons && lessons.length > 5 && (_jsx(Button, { variant: "outline", className: "w-full mt-4", onClick: () => setCurrentView("lessons"), children: "View All Lessons" }))] })] })] }));
            case "math-lessons":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-blue-600", children: "\uD83D\uDCDA Math Lessons - Year 5-9 Excellence" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Master mathematics with interactive video lessons and exercises" }), _jsx("p", { className: "text-sm text-blue-500 mt-2", children: "\u2728 18 Complete Lessons \u2022 540 Exercises \u2022 3 Difficulty Levels \u2022 Solution Videos" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-700", children: "Total Lessons" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-blue-600", children: totalLessons }) })] }), _jsxs(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-700", children: "Completed" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-green-600", children: completedLessons }) })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-700", children: "Your Progress" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-purple-600", children: [progressPercentage.toFixed(0), "%"] }), _jsx(Progress, { value: progressPercentage, className: "mt-2 h-2" })] })] })] }), _jsxs(Card, { className: "bg-blue-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-blue-900", children: "How It Works" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "1\uFE0F\u20E3 Watch Videos" }), _jsx("p", { className: "text-gray-600", children: "Learn concepts with engaging intro videos" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "2\uFE0F\u20E3 Practice Exercises" }), _jsx("p", { className: "text-gray-600", children: "Solve 10 questions at each difficulty level" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "3\uFE0F\u20E3 Score 8/10 to Progress" }), _jsx("p", { className: "text-gray-600", children: "Unlock next level when you reach 8 correct" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "All Math Lessons" }) }), _jsx(CardContent, { children: !lessons || lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: lessons.map((lesson, index) => (_jsx("div", { className: "p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-white to-blue-50", onClick: () => setSelectedLesson(lesson.id), children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0", children: index + 1 }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: lesson.description }), _jsxs("div", { className: "flex gap-2 mt-3", children: [_jsx("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded", children: "Easy" }), _jsx("span", { className: "text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded", children: "Medium" }), _jsx("span", { className: "text-xs bg-red-100 text-red-700 px-2 py-1 rounded", children: "Challenging" })] })] })] }) }, lesson.id))) })) })] })] }));
            case "lessons":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "My Lessons" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Click on a lesson to start learning" })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: !lessons || lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "space-y-3", children: lessons.map((lesson, index) => {
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
                                        return (_jsx("div", { className: `p-4 border rounded-lg transition-all ${isLocked
                                                ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                                                : isCompleted
                                                    ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                                                    : "bg-white border-gray-200 hover:shadow-md cursor-pointer"}`, onClick: () => !isLocked && setSelectedLesson(lesson.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`, children: index + 1 }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600", children: lesson.description })] })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [progress && (_jsxs("div", { className: "text-sm text-gray-600", children: [progress.correctAnswers, "/", progress.totalAttempts, " correct"] })), isCompleted && (_jsx(Trophy, { className: "w-5 h-5 text-green-600" })), isLocked && (_jsx("span", { className: "text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded", children: "Locked" }))] })] }) }, lesson.id));
                                    }) })) }) })] }));
            case "progress":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "My Progress" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track your learning journey" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Lessons" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-blue-600", children: totalLessons }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Completed" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-green-600", children: completedLessons }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "In Progress" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-yellow-600", children: totalLessons - completedLessons }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Overall Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-3xl font-bold text-blue-700", children: [progressPercentage.toFixed(0), "%"] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Lesson by Lesson Progress" }), _jsx(CardDescription, { children: "See your performance on each lesson" })] }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: lessons?.map((lesson, index) => {
                                            const progress = userProgress?.find(p => p.lessonId === lesson.id);
                                            // Check if all 3 levels have 8/10 or better
                                            const isCompleted = progress &&
                                                (progress.easyScore ?? 0) >= 8 &&
                                                (progress.mediumScore ?? 0) >= 8 &&
                                                (progress.challengingScore ?? 0) >= 8;
                                            return (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isCompleted ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`, children: index + 1 }), _jsx("h4", { className: "font-semibold text-gray-900", children: lesson.title })] }), isCompleted && _jsx(Trophy, { className: "w-5 h-5 text-green-600" })] }), progress && (_jsxs("div", { className: "space-y-2 ml-11", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Easy Level:" }), _jsxs("span", { className: "font-medium", children: [progress.easyScore || 0, "/10 ", progress.easyCompleted ? "✓" : ""] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Medium Level:" }), _jsxs("span", { className: "font-medium", children: [progress.mediumScore || 0, "/10 ", progress.mediumCompleted ? "✓" : ""] })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Challenging Level:" }), _jsxs("span", { className: "font-medium", children: [progress.challengingScore || 0, "/10 ", progress.challengingCompleted ? "✓" : ""] })] })] }))] }, lesson.id));
                                        }) }) })] })] }));
            case "notes":
                return _jsx(ImportantNotes, {});
            case "questions":
                return _jsx(AskQuestion, {});
            case "badges":
                return _jsx(StudentBadges, {});
            case "settings":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Settings" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage your account preferences" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Profile Information" }), _jsx(CardDescription, { children: "Your account details" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Name" }), _jsx("p", { className: "text-gray-900 mt-1", children: user?.name || "Demo Student" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Email" }), _jsx("p", { className: "text-gray-900 mt-1", children: user?.email || "Not provided" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-700", children: "Role" }), _jsx("p", { className: "text-gray-900 mt-1 capitalize", children: user?.role || "student" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Notification Preferences" }), _jsx(CardDescription, { children: "Coming soon" })] }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-600", children: "Notification settings will be available soon." }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Display Preferences" }), _jsx(CardDescription, { children: "Coming soon" })] }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-600", children: "Display customization options will be available soon." }) })] })] }));
            case "help":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Help & Support" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Get assistance when you need it" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Contact Support" }), _jsx(CardDescription, { children: "Reach out to our team" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Phone Tutor" }), _jsx("a", { href: "tel:+61499989179", className: "text-blue-600 hover:underline text-lg font-medium", children: "+61 499 989 179" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "(Will be replaced with 1800 number at launch)" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Email Support" }), _jsx("a", { href: "mailto:support@schrool.com", className: "text-blue-600 hover:underline", children: "support@schrool.com" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Frequently Asked Questions" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: "How do I unlock the next lesson?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Complete all three difficulty levels (Easy, Medium, Challenging) of the current lesson with at least 8/10 correct answers in each level." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: "Can I watch solution videos?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "Yes! Solution videos are always available. However, questions where you watched the solution won't count toward your final score." })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: "What is the 8/10 rule?" }), _jsx("p", { className: "text-gray-600 text-sm", children: "You need to answer at least 8 out of 10 questions correctly (without watching solutions) to progress to the next difficulty level or lesson." })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tutorial Videos" }), _jsx(CardDescription, { children: "Coming soon" })] }), _jsx(CardContent, { children: _jsx("p", { className: "text-gray-600", children: "Tutorial videos will be available soon to help you navigate the platform." }) })] })] }));
            default:
                return null;
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex", children: [_jsx("aside", { className: `${sidebarOpen ? "w-64" : "w-0"} lg:w-64 bg-gradient-to-b from-blue-600 to-blue-800 text-white transition-all duration-300 overflow-hidden fixed lg:relative h-screen z-20`, children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-2xl font-bold", children: "SCHROOL" }), _jsx("p", { className: "text-sm text-blue-200 mt-1", children: "Student Portal" })] }), _jsxs("div", { className: "mb-8 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-3 text-2xl font-bold", children: user?.name?.charAt(0).toUpperCase() || "S" }), _jsx("p", { className: "font-semibold", children: user?.name || "Demo Student" }), _jsx("p", { className: "text-sm text-blue-200", children: "Student" })] }), _jsx("nav", { className: "space-y-2", children: navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (_jsxs("button", { onClick: () => setCurrentView(item.id), className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === item.id
                                        ? "bg-white text-blue-600 shadow-lg"
                                        : "text-white hover:bg-blue-700"}`, children: [_jsx(Icon, { className: "w-5 h-5" }), _jsx("span", { className: "text-sm font-medium", children: item.label })] }, item.id));
                            }) })] }) }), _jsxs("div", { className: "flex-1 flex flex-col min-h-screen", children: [_jsx("header", { className: "bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10", children: _jsx("div", { className: "px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setSidebarOpen(!sidebarOpen), className: "lg:hidden", children: sidebarOpen ? _jsx(X, { className: "w-5 h-5" }) : _jsx(Menu, { className: "w-5 h-5" }) }), _jsx("div", { className: "flex-1 lg:hidden" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "hidden sm:flex items-center gap-2 text-sm text-gray-600", children: [_jsx(User, { className: "w-4 h-4" }), _jsx("span", { children: user?.name || "Demo Student" })] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => logout.mutate(), disabled: logout.isPending, children: [_jsx(LogOut, { className: "w-4 h-4 mr-2" }), "Logout"] })] })] }) }) }), _jsx("main", { className: "flex-1 px-4 sm:px-6 lg:px-8 py-8", children: renderContent() })] }), selectedLesson && (_jsx(LessonViewer, { lessonId: selectedLesson, onClose: () => setSelectedLesson(null) })), sidebarOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden", onClick: () => setSidebarOpen(false) }))] }));
}
