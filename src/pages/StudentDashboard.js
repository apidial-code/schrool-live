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
                const response = await fetch("/api/lessons/direct");
                if (response.ok) {
                    const data = await response.json();
                    setLessons(data);
                    console.log(`[StudentDashboard] Loaded ${data.length} lessons from direct API`);
                }
                else {
                    console.error("[StudentDashboard] Failed to fetch lessons:", response.status);
                    setLessons([]);
                }
            }
            catch (error) {
                console.error("[StudentDashboard] Error fetching lessons:", error);
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
    const totalLessons = lessons.length || 0;
    const completedLessons = userProgress ? userProgress.filter(p => p.completed === 1).length : 0;
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
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-3xl font-bold text-gray-900", children: ["Welcome back, ", user?.name || "Student", "!"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Continue your learning journey" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setCurrentView("lessons"), children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Total Lessons" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BookOpen, { className: "w-5 h-5 text-blue-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: totalLessons })] }) })] }), _jsxs(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setCurrentView("progress"), children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Completed" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-green-600" }), _jsx("span", { className: "text-3xl font-bold text-gray-900", children: completedLessons })] }) })] }), _jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-gray-600", children: "Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [progressPercentage.toFixed(0), "%"] }), _jsx(Progress, { value: progressPercentage, className: "h-2" })] }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Actions" }), _jsx(CardDescription, { children: "Jump to your most used features" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("lessons"), children: [_jsx(BookOpen, { className: "w-6 h-6" }), _jsx("span", { children: "My Lessons" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("notes"), children: [_jsx(FileText, { className: "w-6 h-6" }), _jsx("span", { children: "Important Notes" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("questions"), children: [_jsx(MessageSquare, { className: "w-6 h-6" }), _jsx("span", { children: "Ask Question" })] }), _jsxs(Button, { variant: "outline", className: "h-20 flex-col gap-2", onClick: () => setCurrentView("help"), children: [_jsx(HelpCircle, { className: "w-6 h-6" }), _jsx("span", { children: "Get Help" })] })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Continue Learning" }), _jsx(CardDescription, { children: "Pick up where you left off" })] }), _jsxs(CardContent, { children: [lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "space-y-3", children: lessons && lessons.slice(0, 5).map((lesson, index) => {
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
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-blue-600", children: "\uD83D\uDCDA Math Lessons - Year 5-9 Excellence" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Master mathematics with interactive video lessons and exercises" }), _jsx("p", { className: "text-sm text-blue-500 mt-2", children: "\u2728 18 Complete Lessons \u2022 540 Exercises \u2022 3 Difficulty Levels \u2022 Solution Videos" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs(Card, { className: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-blue-700", children: "Total Lessons" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-blue-600", children: totalLessons }) })] }), _jsxs(Card, { className: "bg-gradient-to-br from-green-50 to-green-100 border-green-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-green-700", children: "Completed" }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-3xl font-bold text-green-600", children: completedLessons }) })] }), _jsxs(Card, { className: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200", children: [_jsx(CardHeader, { className: "pb-3", children: _jsx(CardTitle, { className: "text-sm font-medium text-purple-700", children: "Your Progress" }) }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-3xl font-bold text-purple-600", children: [progressPercentage.toFixed(0), "%"] }), _jsx(Progress, { value: progressPercentage, className: "mt-2 h-2" })] })] })] }), _jsxs(Card, { className: "bg-blue-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-blue-900", children: "How It Works" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "1\uFE0F\u20E3 Watch Videos" }), _jsx("p", { className: "text-gray-600", children: "Learn concepts with engaging intro videos" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "2\uFE0F\u20E3 Practice Exercises" }), _jsx("p", { className: "text-gray-600", children: "Solve 10 questions per difficulty level" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "font-semibold text-blue-600", children: "3\uFE0F\u20E3 Track Progress" }), _jsx("p", { className: "text-gray-600", children: "Monitor your scores and unlock new lessons" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "All Math Lessons" }) }), _jsx(CardContent, { children: lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "space-y-3", children: lessons && lessons.map((lesson, index) => {
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
                                            return (_jsx("div", { className: `p-4 border rounded-lg transition-all ${isLocked
                                                    ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                                                    : isCompleted
                                                        ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                                                        : "bg-white border-gray-200 hover:shadow-md cursor-pointer"}`, onClick: () => !isLocked && setSelectedLesson(lesson.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`, children: index + 1 }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600", children: lesson.description })] })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [isCompleted && (_jsx(Trophy, { className: "w-5 h-5 text-green-600" })), isLocked && (_jsx("span", { className: "text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded", children: "Locked" }))] })] }) }, lesson.id));
                                        }) })) })] })] }));
            case "lessons":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "My Lessons" }), _jsx("p", { className: "text-gray-600 mt-1", children: "All available lessons" })] }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet. Check back soon!" })) : (_jsx("div", { className: "space-y-3", children: lessons && lessons.map((lesson, index) => {
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
                                        return (_jsx("div", { className: `p-4 border rounded-lg transition-all ${isLocked
                                                ? "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                                                : isCompleted
                                                    ? "bg-green-50 border-green-200 hover:shadow-md cursor-pointer"
                                                    : "bg-white border-gray-200 hover:shadow-md cursor-pointer"}`, onClick: () => !isLocked && setSelectedLesson(lesson.id), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-10 h-10 rounded-full flex items-center justify-center font-bold ${isCompleted ? "bg-green-600 text-white" : isLocked ? "bg-gray-300 text-gray-600" : "bg-blue-600 text-white"}`, children: index + 1 }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600", children: lesson.description })] })] }) }), _jsxs("div", { className: "flex items-center gap-4", children: [isCompleted && (_jsx(Trophy, { className: "w-5 h-5 text-green-600" })), isLocked && (_jsx("span", { className: "text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded", children: "Locked" }))] })] }) }, lesson.id));
                                    }) })) }) })] }));
            case "progress":
                return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "My Progress" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Overview of your learning journey" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Overall Progress" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-lg font-medium", children: "Lessons Completed:" }), _jsxs("span", { className: "text-lg font-bold text-blue-600", children: [completedLessons, " / ", totalLessons] })] }), _jsx(Progress, { value: progressPercentage, className: "h-3" }), _jsxs("div", { className: "text-right text-sm text-gray-600", children: [progressPercentage.toFixed(0), "% Complete"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Lesson Breakdown" }) }), _jsx(CardContent, { children: lessons.length === 0 ? (_jsx("div", { className: "text-center py-8 text-gray-500", children: "No lessons available yet." })) : (_jsx("div", { className: "space-y-4", children: lessons && lessons.map(lesson => {
                                            const progress = userProgress?.find(p => p.lessonId === lesson.id);
                                            const easyScore = progress?.easyScore ?? 0;
                                            const mediumScore = progress?.mediumScore ?? 0;
                                            const challengingScore = progress?.challengingScore ?? 0;
                                            const overallScore = (easyScore + mediumScore + challengingScore) / 3;
                                            return (_jsxs("div", { className: "border-b pb-4 last:border-b-0", children: [_jsx("h3", { className: "font-semibold text-lg text-gray-800", children: lesson.title }), _jsxs("div", { className: "mt-2 space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Easy:" }), _jsx(Progress, { value: easyScore * 10, className: "w-2/3 h-2" }), _jsxs("span", { className: "font-medium", children: [easyScore, "/10"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Medium:" }), _jsx(Progress, { value: mediumScore * 10, className: "w-2/3 h-2" }), _jsxs("span", { className: "font-medium", children: [mediumScore, "/10"] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: "Challenging:" }), _jsx(Progress, { value: challengingScore * 10, className: "w-2/3 h-2" }), _jsxs("span", { className: "font-medium", children: [challengingScore, "/10"] })] }), _jsxs("div", { className: "flex justify-between items-center font-bold mt-2 pt-2 border-t", children: [_jsx("span", { children: "Overall:" }), _jsx(Progress, { value: overallScore * 10, className: "w-2/3 h-2" }), _jsxs("span", { children: [overallScore.toFixed(1), "/10"] })] })] })] }, lesson.id));
                                        }) })) })] })] }));
            case "notes":
                return _jsx(ImportantNotes, {});
            case "questions":
                return _jsx(AskQuestion, {});
            case "badges":
                return _jsx(StudentBadges, {});
            case "settings":
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Settings" }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Profile Settings" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Manage your profile information here." }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Notification Settings" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Configure your notification preferences." }) })] })] }));
            case "help":
                return (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Help & Support" }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "FAQ" }) }), _jsx(CardContent, { children: _jsx("p", { children: "Find answers to common questions." }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Contact Support" }) }), _jsx(CardContent, { children: _jsx("p", { children: "If you need further assistance, please contact our support team." }) })] })] }));
            default:
                return (_jsx("div", { className: "text-center py-10 text-gray-500", children: _jsx("p", { children: "Select an item from the sidebar to view content." }) }));
        }
    };
    return (_jsxs("div", { className: "flex min-h-screen bg-gray-100", children: [_jsxs("div", { className: `fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex lg:flex-col`, style: { width: sidebarOpen ? "280px" : "0" }, children: [_jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [_jsx("h1", { className: "text-2xl font-bold text-blue-700", children: "SCHROOL" }), _jsx(Button, { variant: "ghost", size: "icon", className: "lg:hidden", onClick: () => setSidebarOpen(false), children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsxs("nav", { className: "flex-1 p-4 space-y-2", children: [navigationItems.map((item) => (_jsxs(Button, { variant: currentView === item.id ? "secondary" : "ghost", className: `w-full justify-start gap-3 ${item.highlight ? "bg-blue-100 text-blue-700 hover:bg-blue-200" : ""}`, onClick: () => {
                                    setCurrentView(item.id);
                                    setSidebarOpen(false);
                                }, children: [_jsx(item.icon, { className: "h-5 w-5" }), item.label] }, item.id))), _jsxs(Button, { variant: "ghost", className: "w-full justify-start gap-3 text-red-600 hover:bg-red-50 hover:text-red-700", onClick: () => logout.mutate(), children: [_jsx(LogOut, { className: "h-5 w-5" }), "Logout"] })] })] }), _jsxs("div", { className: "flex-1 flex flex-col lg:ml-70", children: [_jsxs("header", { className: "bg-white shadow-sm p-4 flex items-center justify-between lg:hidden", children: [_jsx(Button, { variant: "ghost", size: "icon", onClick: () => setSidebarOpen(true), children: _jsx(Menu, { className: "h-6 w-6" }) }), _jsx("h1", { className: "text-xl font-bold text-blue-700", children: "SCHROOL" }), _jsx(User, { className: "h-6 w-6 text-gray-600" })] }), _jsx("main", { className: "flex-1 p-6 bg-gray-50 overflow-y-auto", children: selectedLesson ? (_jsx(LessonViewer, { lessonId: selectedLesson, onClose: () => setSelectedLesson(null) })) : (renderContent()) })] })] }));
}
