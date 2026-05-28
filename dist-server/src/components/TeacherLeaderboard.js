import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";
export default function TeacherLeaderboard() {
    // Mock data for demonstration
    const leaderboard = [
        { rank: 1, name: "Sarah Johnson", sessions: 156, rating: 4.9, badge: "gold", bonus: 500 },
        { rank: 2, name: "Michael Chen", sessions: 142, rating: 4.8, badge: "silver", bonus: 300 },
        { rank: 3, name: "Emma Williams", sessions: 138, rating: 4.8, badge: "bronze", bonus: 200 },
        { rank: 4, name: "David Martinez", sessions: 125, rating: 4.7, badge: null, bonus: 0 },
        { rank: 5, name: "Lisa Anderson", sessions: 118, rating: 4.7, badge: null, bonus: 0 },
    ];
    const myAchievements = [
        { type: "100_sessions", tier: "gold", earnedAt: "2025-12-15", description: "Delivered 100+ sessions" },
        { type: "perfect_rating", tier: "platinum", earnedAt: "2025-11-20", description: "Achieved 5.0 rating for 3 months" },
        { type: "monthly_top_performer", tier: "gold", earnedAt: "2025-10-31", description: "Top performer in October 2025" },
    ];
    const getBadgeIcon = (badge, size = "w-8 h-8") => {
        if (badge === "gold")
            return _jsx(Trophy, { className: `${size} text-yellow-500` });
        if (badge === "silver")
            return _jsx(Medal, { className: `${size} text-gray-400` });
        if (badge === "bronze")
            return _jsx(Award, { className: `${size} text-orange-600` });
        return null;
    };
    const getTierColor = (tier) => {
        if (tier === "platinum")
            return "bg-gradient-to-r from-purple-500 to-pink-500";
        if (tier === "gold")
            return "bg-gradient-to-r from-yellow-400 to-yellow-600";
        if (tier === "silver")
            return "bg-gradient-to-r from-gray-300 to-gray-500";
        if (tier === "bronze")
            return "bg-gradient-to-r from-orange-400 to-orange-600";
        return "bg-gray-200";
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Performance Leaderboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monthly rankings and achievements" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Star, { className: "w-5 h-5 text-yellow-500" }), "My Achievements"] }), _jsx(CardDescription, { children: "Badges and milestones you've earned" })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: myAchievements.map((achievement, index) => (_jsxs("div", { className: `${getTierColor(achievement.tier)} rounded-lg p-4 text-white shadow-lg`, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-semibold uppercase", children: achievement.tier }), getBadgeIcon(achievement.tier === "platinum" ? "gold" : achievement.tier, "w-6 h-6")] }), _jsx("p", { className: "font-bold text-lg mb-1", children: achievement.description }), _jsxs("p", { className: "text-sm opacity-90", children: ["Earned ", new Date(achievement.earnedAt).toLocaleDateString()] })] }, index))) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-5 h-5 text-blue-600" }), "January 2026 Leaderboard"] }), _jsx(CardDescription, { children: "Top performers ranked by sessions delivered and student ratings" })] }) }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-3", children: leaderboard.map((teacher) => (_jsxs("div", { className: `flex items-center justify-between p-4 rounded-lg ${teacher.rank <= 3 ? "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200" : "bg-gray-50"}`, children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: `flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${teacher.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                                                        teacher.rank === 2 ? "bg-gray-300 text-gray-700" :
                                                            teacher.rank === 3 ? "bg-orange-400 text-orange-900" :
                                                                "bg-gray-200 text-gray-600"}`, children: teacher.rank }), teacher.badge && (_jsx("div", { className: "hidden md:block", children: getBadgeIcon(teacher.badge) })), _jsxs("div", { children: [_jsx("p", { className: "font-bold text-gray-900", children: teacher.name }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsxs("span", { children: [teacher.sessions, " sessions"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Star, { className: "w-4 h-4 text-yellow-500 fill-yellow-500" }), teacher.rating] })] })] })] }), teacher.bonus > 0 && (_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Performance Bonus" }), _jsxs("p", { className: "font-bold text-green-600 text-lg", children: ["$", teacher.bonus] })] }))] }, teacher.rank))) }), _jsxs("div", { className: "mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("h4", { className: "font-semibold text-blue-900 mb-2", children: "Monthly Performance Bonuses" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-3 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Trophy, { className: "w-5 h-5 text-yellow-500" }), _jsxs("span", { children: [_jsx("strong", { children: "1st Place:" }), " $500 bonus"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Medal, { className: "w-5 h-5 text-gray-400" }), _jsxs("span", { children: [_jsx("strong", { children: "2nd Place:" }), " $300 bonus"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Award, { className: "w-5 h-5 text-orange-600" }), _jsxs("span", { children: [_jsx("strong", { children: "3rd Place:" }), " $200 bonus"] })] })] })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Achievement Milestones" }), _jsx(CardDescription, { children: "Unlock badges by reaching these milestones" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200", children: [_jsx("h4", { className: "font-semibold text-orange-900 mb-2", children: "Session Milestones" }), _jsxs("ul", { className: "space-y-1 text-sm text-orange-800", children: [_jsx("li", { children: "\u2022 50 sessions \u2192 Bronze Badge" }), _jsx("li", { children: "\u2022 100 sessions \u2192 Silver Badge" }), _jsx("li", { children: "\u2022 200 sessions \u2192 Gold Badge" }), _jsx("li", { children: "\u2022 500 sessions \u2192 Platinum Badge" })] })] }), _jsxs("div", { className: "p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200", children: [_jsx("h4", { className: "font-semibold text-purple-900 mb-2", children: "Rating Milestones" }), _jsxs("ul", { className: "space-y-1 text-sm text-purple-800", children: [_jsx("li", { children: "\u2022 4.5+ rating (1 month) \u2192 Bronze Badge" }), _jsx("li", { children: "\u2022 4.7+ rating (3 months) \u2192 Silver Badge" }), _jsx("li", { children: "\u2022 4.8+ rating (6 months) \u2192 Gold Badge" }), _jsx("li", { children: "\u2022 5.0 rating (3 months) \u2192 Platinum Badge" })] })] })] }) })] })] }));
}
