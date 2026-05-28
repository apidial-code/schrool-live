import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export function ZoomSessionsView() {
    const { data: sessionsData, isLoading } = trpc.zoom.getUpcomingSessions.useQuery();
    const handleJoinMeeting = (zoomLink) => {
        if (zoomLink) {
            window.open(zoomLink, "_blank");
            toast.success("Opening Zoom meeting...");
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "animate-spin w-6 h-6 text-blue-600" }) }));
    }
    const sessions = sessionsData?.sessions || [];
    if (sessions.length === 0) {
        return (_jsxs(Card, { className: "p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50", children: [_jsx(Video, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Zoom Sessions Scheduled" }), _jsx("p", { className: "text-gray-600", children: "Your Elite Zoom sessions will appear here once they're scheduled by your teacher." })] }));
    }
    // Separate upcoming and past sessions
    const now = new Date();
    const upcomingSessions = sessions.filter((s) => new Date(s.scheduledAt) > now);
    const pastSessions = sessions.filter((s) => new Date(s.scheduledAt) <= now);
    return (_jsxs("div", { className: "space-y-6", children: [upcomingSessions.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Upcoming Sessions" }), _jsx("div", { className: "grid gap-4", children: upcomingSessions.map((session) => (_jsx(Card, { className: "p-6 border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: ["Elite Zoom Session ", session.sessionNumber] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2 text-blue-600" }), format(new Date(session.scheduledAt), "EEEE, MMMM d, yyyy")] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Clock, { className: "w-4 h-4 mr-2 text-blue-600" }), format(new Date(session.scheduledAt), "h:mm a"), " (", session.duration, " minutes)"] })] })] }), session.zoomLink && (_jsxs(Button, { onClick: () => handleJoinMeeting(session.zoomLink || ""), className: "bg-blue-600 hover:bg-blue-700 text-white ml-4", children: [_jsx(Video, { className: "w-4 h-4 mr-2" }), "Join Meeting", _jsx(ExternalLink, { className: "w-4 h-4 ml-2" })] }))] }) }, session.id))) })] })), pastSessions.length > 0 && (_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Past Sessions" }), _jsx("div", { className: "grid gap-4", children: pastSessions.map((session) => (_jsx(Card, { className: "p-6 opacity-75 bg-gray-50", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-700 mb-3", children: ["Session ", session.sessionNumber, " - Completed"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), format(new Date(session.scheduledAt), "MMMM d, yyyy")] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), format(new Date(session.scheduledAt), "h:mm a")] })] })] }), _jsx("div", { className: "bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium", children: "Completed" })] }) }, session.id))) })] }))] }));
}
