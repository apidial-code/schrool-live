import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trophy, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export function Leaderboard({ topStudents, userRank, isLoading }) {
    const getMedalIcon = (rank) => {
        if (rank === 1)
            return _jsx("span", { className: "text-2xl", children: "\uD83E\uDD47" });
        if (rank === 2)
            return _jsx("span", { className: "text-2xl", children: "\uD83E\uDD48" });
        if (rank === 3)
            return _jsx("span", { className: "text-2xl", children: "\uD83E\uDD49" });
        return _jsxs("span", { className: "text-lg font-bold text-gray-600", children: ["#", rank] });
    };
    if (isLoading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-yellow-600" }), "Leaderboard"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "text-center py-8 text-gray-500", children: "Loading leaderboard..." }) })] }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-yellow-600" }), "Leaderboard"] }), _jsx(CardDescription, { children: "Top students by lessons completed and average score" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "space-y-2", children: topStudents.map((entry) => (_jsxs("div", { className: `flex items-center justify-between p-3 rounded-lg transition-colors ${entry.rank <= 3
                                ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                                : "bg-gray-50 border border-gray-200"}`, children: [_jsxs("div", { className: "flex items-center gap-3 flex-1", children: [_jsx("div", { className: "w-8 flex justify-center", children: getMedalIcon(entry.rank) }), _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: entry.user.name }), _jsxs("p", { className: "text-xs text-gray-600", children: [entry.lessonsCompleted, " lessons \u2022 ", entry.averageScore.toFixed(1), "% avg"] })] })] }), _jsx("div", { className: "flex gap-2", children: _jsxs(Badge, { variant: "outline", className: "text-xs", children: [entry.badgesEarned, " badges"] }) })] }, entry.rank))) }), userRank && (_jsxs("div", { className: "mt-6 pt-4 border-t border-gray-200", children: [_jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Your Rank" }), _jsxs("div", { className: "flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Flame, { className: "w-6 h-6 text-blue-600" }), _jsxs("div", { children: [_jsxs("h3", { className: "font-semibold text-gray-900", children: ["Rank #", userRank.rank] }), _jsxs("p", { className: "text-sm text-gray-600", children: [userRank.lessonsCompleted, " lessons completed"] })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-blue-600", children: [userRank.averageScore.toFixed(1), "%"] }), _jsx("p", { className: "text-xs text-gray-600", children: "Average Score" })] })] })] }))] })] }));
}
