import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Calendar, Clock, Users, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export function ZoomSessionsList() {
    const [copiedId, setCopiedId] = useState(null);
    // Fetch upcoming sessions
    const { data: sessionsData, isLoading, refetch } = trpc.zoom.getUpcomingSessions.useQuery();
    // Reschedule mutation
    const reschedule = trpc.zoom.rescheduleSession.useMutation({
        onSuccess: () => {
            toast.success("Session rescheduled successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to reschedule session");
        },
    });
    // Cancel mutation
    const cancel = trpc.zoom.cancelSession.useMutation({
        onSuccess: () => {
            toast.success("Session cancelled successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to cancel session");
        },
    });
    const copyToClipboard = (text, sessionId) => {
        navigator.clipboard.writeText(text);
        setCopiedId(sessionId);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "animate-spin w-6 h-6 text-blue-600" }) }));
    }
    const sessions = sessionsData?.sessions || [];
    if (sessions.length === 0) {
        return (_jsxs(Card, { className: "p-8 text-center", children: [_jsx(Calendar, { className: "w-12 h-12 text-gray-400 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Upcoming Sessions" }), _jsx("p", { className: "text-gray-600", children: "You don't have any scheduled Zoom sessions yet." })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Upcoming Zoom Sessions" }), _jsxs("span", { className: "bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium", children: [sessions.length, " sessions"] })] }), _jsx("div", { className: "grid gap-4", children: sessions.map((session) => (_jsxs(Card, { className: "p-6 hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: ["Session ", session.sessionNumber] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Calendar, { className: "w-4 h-4 mr-2" }), format(new Date(session.scheduledAt), "MMMM d, yyyy")] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Clock, { className: "w-4 h-4 mr-2" }), format(new Date(session.scheduledAt), "h:mm a"), " (", session.duration, " min)"] }), _jsxs("div", { className: "flex items-center text-gray-600", children: [_jsx(Users, { className: "w-4 h-4 mr-2" }), "Student ID: ", session.studentId] })] })] }), _jsx("div", { className: "flex items-center", children: _jsxs("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800", children: [_jsx(CheckCircle, { className: "w-4 h-4 mr-1" }), session.status] }) })] }), session.zoomLink && (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg mb-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Zoom Meeting Link" }), _jsx("p", { className: "text-sm font-mono text-gray-900 truncate", children: session.zoomLink })] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => copyToClipboard(session.zoomLink || "", session.id), className: "ml-2", children: copiedId === session.id ? (_jsx(CheckCircle, { className: "w-4 h-4" })) : (_jsx(Copy, { className: "w-4 h-4" })) })] }), session.zoomPassword && (_jsxs("div", { className: "mt-2 pt-2 border-t", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Password" }), _jsx("p", { className: "text-sm font-mono text-gray-900", children: session.zoomPassword })] }))] })), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                        const newDate = new Date(session.scheduledAt);
                                        newDate.setDate(newDate.getDate() + 1);
                                        reschedule.mutate({
                                            sessionId: session.id,
                                            newScheduledAt: newDate,
                                        });
                                    }, disabled: reschedule.isPending, children: reschedule.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : ("Reschedule") }), _jsx(Button, { variant: "destructive", size: "sm", onClick: () => {
                                        if (confirm("Are you sure you want to cancel this session?")) {
                                            cancel.mutate({
                                                sessionId: session.id,
                                                reason: "Cancelled by teacher",
                                            });
                                        }
                                    }, disabled: cancel.isPending, children: cancel.isPending ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : ("Cancel") })] })] }, session.id))) })] }));
}
