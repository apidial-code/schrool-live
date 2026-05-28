import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { trpc } from "@/lib/trpc";
import { Loader2, Trophy, Star, Award, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
export function ParentAchievements({ studentId, studentName }) {
    const { data: achievements, isLoading } = trpc.parent.getChildAchievements.useQuery({ studentId });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-700" }) }));
    }
    const getAchievementIcon = (type) => {
        switch (type) {
            case "perfect_score":
                return _jsx(Star, { className: "w-8 h-8 text-amber-500" });
            case "streak":
                return _jsx(Zap, { className: "w-8 h-8 text-blue-500" });
            case "milestone":
                return _jsx(Trophy, { className: "w-8 h-8 text-blue-500" });
            case "question_master":
                return _jsx(Award, { className: "w-8 h-8 text-green-500" });
            default:
                return _jsx(Trophy, { className: "w-8 h-8 text-gray-500" });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Achievements" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [studentName, "'s milestones and accomplishments"] })] }), achievements && achievements.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: achievements.map((achievement) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex flex-col items-center text-center", children: [_jsx("div", { className: "mb-4", children: getAchievementIcon(achievement.achievementType) }), _jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: achievement.title }), _jsx("p", { className: "text-sm text-gray-600 mb-3", children: achievement.description }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Earned ", format(new Date(achievement.earnedAt), "PPP")] })] }) }) }, achievement.id))) })) : (_jsx(Card, { children: _jsx(CardContent, { className: "py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Trophy, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Achievements Yet" }), _jsxs("p", { className: "text-gray-600", children: ["Keep learning! Achievements will appear here as ", studentName, " progresses."] })] }) }) }))] }));
}
