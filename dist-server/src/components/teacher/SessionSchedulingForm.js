import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar, Users } from "lucide-react";
import { toast } from "sonner";
export function SessionSchedulingForm({ enrollmentId, studentId, teacherId, onSuccess, }) {
    const [formData, setFormData] = useState({
        startDate: new Date().toISOString().split("T")[0],
        sessionCount: 48,
        timezone: "UTC",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createBulkSessions = trpc.zoom.createBulkSessions.useMutation({
        onSuccess: (data) => {
            toast.success(`Successfully created ${data.count} Zoom sessions!`);
            setFormData({
                startDate: new Date().toISOString().split("T")[0],
                sessionCount: 48,
                timezone: "UTC",
            });
            onSuccess?.();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create sessions");
        },
    });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const startDate = new Date(formData.startDate);
            if (isNaN(startDate.getTime())) {
                toast.error("Invalid start date");
                return;
            }
            await createBulkSessions.mutateAsync({
                enrollmentId,
                studentId,
                teacherId,
                startDate,
                sessionCount: parseInt(formData.sessionCount.toString()),
                timezone: formData.timezone,
            });
        }
        catch (error) {
            console.error("Form submission error:", error);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const timezones = [
        "UTC",
        "America/New_York",
        "America/Chicago",
        "America/Denver",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Europe/Tokyo",
        "Asia/Singapore",
        "Australia/Sydney",
    ];
    return (_jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Schedule Zoom Sessions" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Calendar, { className: "w-4 h-4 inline mr-2" }), "Start Date"] }), _jsx(Input, { type: "date", value: formData.startDate, onChange: (e) => setFormData({ ...formData, startDate: e.target.value }), required: true, className: "w-full" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Sessions will be scheduled 2x per week from this date" })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [_jsx(Users, { className: "w-4 h-4 inline mr-2" }), "Number of Sessions"] }), _jsx(Input, { type: "number", min: "1", max: "100", value: formData.sessionCount, onChange: (e) => setFormData({
                                            ...formData,
                                            sessionCount: Math.min(100, Math.max(1, parseInt(e.target.value) || 1)),
                                        }), required: true, className: "w-full" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Typical: 48 (Year 5/6), 64 (Year 7), 86 (Year 8), 78 (Year 9)" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Timezone" }), _jsx("select", { value: formData.timezone, onChange: (e) => setFormData({ ...formData, timezone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500", children: timezones.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) })] })] }), _jsxs("div", { className: "bg-blue-50 p-4 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-gray-900 mb-2", children: "Session Summary" }), _jsxs("ul", { className: "text-sm text-gray-700 space-y-1", children: [_jsxs("li", { children: ["\u2022 Start Date: ", new Date(formData.startDate).toLocaleDateString()] }), _jsxs("li", { children: ["\u2022 Total Sessions: ", formData.sessionCount] }), _jsx("li", { children: "\u2022 Frequency: 2x per week" }), _jsxs("li", { children: ["\u2022 Timezone: ", formData.timezone] }), _jsxs("li", { children: ["\u2022 Duration: ~", Math.ceil(formData.sessionCount / 2), " weeks"] })] })] }), _jsx(Button, { type: "submit", disabled: isSubmitting || createBulkSessions.isPending, className: "w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg", children: isSubmitting || createBulkSessions.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin mr-2" }), "Creating Sessions..."] })) : ("Schedule All Sessions") })] })] }));
}
