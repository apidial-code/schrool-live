import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";
const DAYS_OF_WEEK = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
];
const TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
    "Pacific/Auckland",
];
export default function TeacherAvailability() {
    const [, setLocation] = useLocation();
    const [slots, setSlots] = useState([]);
    const { data: profile, isLoading: profileLoading } = trpc.teacher.getMyTeacherProfile.useQuery();
    const { data: existingAvailability, isLoading: availabilityLoading } = trpc.teacher.getMyAvailability.useQuery();
    const saveMutation = trpc.teacher.setAvailability.useMutation({
        onSuccess: () => {
            toast.success("Availability updated successfully!");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to update availability");
        },
    });
    // Load existing availability
    useEffect(() => {
        if (existingAvailability && existingAvailability.length > 0) {
            setSlots(existingAvailability.map((slot) => ({
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                timezone: slot.timezone,
            })));
        }
    }, [existingAvailability]);
    const addSlot = () => {
        setSlots([
            ...slots,
            {
                dayOfWeek: 1,
                startTime: "09:00",
                endTime: "17:00",
                timezone: profile?.timezone || "UTC",
            },
        ]);
    };
    const removeSlot = (index) => {
        setSlots(slots.filter((_, i) => i !== index));
    };
    const updateSlot = (index, field, value) => {
        const updated = [...slots];
        updated[index] = { ...updated[index], [field]: value };
        setSlots(updated);
    };
    const handleSave = () => {
        // Validate slots
        for (const slot of slots) {
            if (slot.startTime >= slot.endTime) {
                toast.error("End time must be after start time for all slots");
                return;
            }
        }
        saveMutation.mutate({ slots });
    };
    if (profileLoading || availabilityLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) }));
    }
    if (!profile) {
        return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsx("div", { className: "container max-w-2xl", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Teacher Profile Required" }), _jsx(CardDescription, { children: "You need to apply as a teacher before setting your availability." })] }), _jsx(CardContent, { children: _jsx(Button, { onClick: () => setLocation("/teacher/apply"), children: "Apply as Teacher" }) })] }) }) }));
    }
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsx("div", { className: "container max-w-4xl", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "text-3xl flex items-center gap-2", children: [_jsx(Clock, { className: "h-8 w-8" }), "Set Your Availability"] }), _jsx(CardDescription, { children: "Define your weekly teaching availability. Students will be matched based on these time slots." })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "space-y-4", children: slots.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx("p", { children: "No availability slots set yet." }), _jsx("p", { className: "text-sm", children: "Click \"Add Time Slot\" to get started." })] })) : (slots.map((slot, index) => (_jsxs(Card, { className: "p-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Day" }), _jsx("select", { value: slot.dayOfWeek, onChange: (e) => updateSlot(index, "dayOfWeek", parseInt(e.target.value)), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm", children: DAYS_OF_WEEK.map((day) => (_jsx("option", { value: day.value, children: day.label }, day.value))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Start Time" }), _jsx("input", { type: "time", value: slot.startTime, onChange: (e) => updateSlot(index, "startTime", e.target.value), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "End Time" }), _jsx("input", { type: "time", value: slot.endTime, onChange: (e) => updateSlot(index, "endTime", e.target.value), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Timezone" }), _jsx("select", { value: slot.timezone, onChange: (e) => updateSlot(index, "timezone", e.target.value), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm", children: TIMEZONES.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) })] })] }), _jsx("div", { className: "mt-4 flex justify-end", children: _jsxs(Button, { variant: "destructive", size: "sm", onClick: () => removeSlot(index), children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), "Remove"] }) })] }, index)))) }), _jsxs(Button, { onClick: addSlot, variant: "outline", className: "w-full", children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Add Time Slot"] }), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsxs(Button, { onClick: handleSave, disabled: saveMutation.isPending || slots.length === 0, className: "flex-1", children: [saveMutation.isPending && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Save Availability"] }), _jsx(Button, { variant: "outline", onClick: () => setLocation("/dashboard"), disabled: saveMutation.isPending, children: "Cancel" })] }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "Your availability will be used to match you with students in compatible timezones." })] })] }) }) }));
}
