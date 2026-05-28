import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";
const DAYS_OF_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const TIME_SLOTS = [
    "06:00-08:00",
    "08:00-10:00",
    "10:00-12:00",
    "12:00-14:00",
    "14:00-16:00",
    "16:00-18:00",
    "18:00-20:00",
    "20:00-22:00",
];
export default function Enrollment() {
    const [, setLocation] = useLocation();
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [tier, setTier] = useState("standard");
    const [preferredDays, setPreferredDays] = useState([]);
    const [preferredTimes, setPreferredTimes] = useState([]);
    const [timezone, setTimezone] = useState("");
    const { data: courses, isLoading } = trpc.enrollment.getCourses.useQuery();
    const createEnrollment = trpc.enrollment.createEnrollment.useMutation({
        onSuccess: () => {
            toast.success("Enrollment Submitted", {
                description: "Your enrollment has been submitted successfully. Awaiting payment confirmation.",
            });
            setLocation("/");
        },
        onError: (error) => {
            toast.error("Enrollment Failed", {
                description: error.message,
            });
        },
    });
    useEffect(() => {
        // Detect user's timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setTimezone(detectedTimezone);
    }, []);
    const handleDayToggle = (day) => {
        setPreferredDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
    };
    const handleTimeToggle = (time) => {
        setPreferredTimes((prev) => prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]);
    };
    const handleSubmit = () => {
        if (!selectedCourse) {
            toast.error("Course Required", {
                description: "Please select a course to enroll in.",
            });
            return;
        }
        if (tier === "elite" && (preferredDays.length === 0 || preferredTimes.length === 0)) {
            toast.error("Preferences Required", {
                description: "Please select your preferred days and times for Elite enrollment.",
            });
            return;
        }
        createEnrollment.mutate({
            courseId: selectedCourse,
            tier,
            preferredDays: tier === "elite" ? preferredDays : undefined,
            preferredTimes: tier === "elite" ? preferredTimes : undefined,
            timezone: tier === "elite" ? timezone : undefined,
        });
    };
    const selectedCourseData = courses?.find((c) => c.id === selectedCourse);
    if (isLoading) {
        return (_jsx("div", { className: "container mx-auto py-8", children: _jsx("p", { children: "Loading courses..." }) }));
    }
    return (_jsxs("div", { className: "container mx-auto py-8 max-w-4xl", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-4xl font-bold text-[#4169E1] mb-2", children: "Transform Your Math Journey" }), _jsx("p", { className: "text-gray-600", children: "SCHROOL's proprietary 5QHackMath method delivers results where traditional tutoring fails. Specialized for struggling students with proven transformation outcomes." })] }), _jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Select Your Course" }), _jsx(CardDescription, { children: "Choose the year level that matches your current grade" })] }), _jsx(CardContent, { children: _jsx(RadioGroup, { value: selectedCourse?.toString(), onValueChange: (value) => setSelectedCourse(Number(value)), children: courses?.map((course) => (_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50", children: [_jsx(RadioGroupItem, { value: course.id.toString(), id: `course-${course.id}` }), _jsx("div", { className: "flex-1", children: _jsxs(Label, { htmlFor: `course-${course.id}`, className: "cursor-pointer", children: [_jsx("div", { className: "font-semibold text-lg", children: course.yearLevel }), _jsx("div", { className: "text-sm text-gray-600 mt-1", children: course.description }), _jsxs("div", { className: "text-sm text-gray-500 mt-2", children: ["Duration: ", course.durationWeeks, " weeks"] })] }) })] }, course.id))) }) })] }), selectedCourseData && (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Choose Your Enrollment Tier" }), _jsx(CardDescription, { children: "Standard includes video lessons and exercises. Elite adds personalized Zoom sessions with expert teachers." })] }), _jsx(CardContent, { children: _jsxs(RadioGroup, { value: tier, onValueChange: (value) => setTier(value), children: [_jsxs("div", { className: "flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50", children: [_jsx(RadioGroupItem, { value: "standard", id: "tier-standard" }), _jsx("div", { className: "flex-1", children: _jsxs(Label, { htmlFor: "tier-standard", className: "cursor-pointer", children: [_jsx("div", { className: "font-semibold text-lg", children: "Standard" }), _jsxs("div", { className: "text-2xl font-bold text-[#4169E1] mt-1", children: ["$", selectedCourseData.standardPrice] }), _jsx("p", { className: "text-xs text-gray-500 mt-1 mb-2", children: "Self-paced learning with comprehensive support" }), _jsxs("ul", { className: "text-sm text-gray-600 mt-2 space-y-1", children: [_jsx("li", { children: "\u2713 Complete video lesson library" }), _jsx("li", { children: "\u2713 8/10 progression rule system" }), _jsx("li", { children: "\u2713 Online phone tutor support" }), _jsx("li", { children: "\u2713 Progress tracking dashboard" }), _jsx("li", { children: "\u2713 PDF resources & solutions" })] })] }) })] }), _jsxs("div", { className: "flex items-start space-x-3 p-4 border-2 border-[#4169E1] rounded-lg hover:bg-blue-50", children: [_jsx(RadioGroupItem, { value: "elite", id: "tier-elite" }), _jsx("div", { className: "flex-1", children: _jsxs(Label, { htmlFor: "tier-elite", className: "cursor-pointer", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-semibold text-lg", children: "Elite" }), _jsx("span", { className: "bg-[#4169E1] text-white text-xs px-2 py-1 rounded", children: "TRANSFORMATION PROGRAM" })] }), _jsxs("div", { className: "text-2xl font-bold text-[#4169E1] mt-1", children: ["$", selectedCourseData.elitePrice] }), _jsx("p", { className: "text-xs text-gray-500 mt-1 mb-2", children: "Complete transformation system for struggling students" }), _jsxs("ul", { className: "text-sm text-gray-600 mt-2 space-y-1", children: [_jsx("li", { children: "\u2713 Everything in Standard, PLUS:" }), _jsxs("li", { children: ["\u2713 ", selectedCourseData.sessionsCount, " live 1-on-1 specialist sessions"] }), _jsx("li", { children: "\u2713 Proprietary 5QHackMath method" }), _jsx("li", { children: "\u2713 Pre-trained specialist teachers ($30/session value)" }), _jsxs("li", { children: ["\u2713 Twice-weekly personalized guidance (", selectedCourseData.durationWeeks, " weeks)"] }), _jsx("li", { children: "\u2713 Expert matching: timezone + grade level" }), _jsx("li", { children: "\u2713 Direct teacher messaging & support" })] }), _jsx("div", { className: "mt-3 pt-3 border-t border-gray-200", children: _jsxs("p", { className: "text-xs font-medium text-gray-700", children: ["Per-session value: $", (parseFloat(selectedCourseData.elitePrice) / selectedCourseData.sessionsCount).toFixed(2)] }) })] }) })] })] }) })] })), tier === "elite" && selectedCourseData && (_jsxs(Card, { className: "mb-6", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Session Preferences" }), _jsxs(CardDescription, { children: ["Select your preferred days and times. We'll match you with an available teacher. Your timezone: ", timezone] })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-base font-semibold mb-3 block", children: "Preferred Days (select at least 2)" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: DAYS_OF_WEEK.map((day) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `day-${day}`, checked: preferredDays.includes(day), onCheckedChange: () => handleDayToggle(day) }), _jsx(Label, { htmlFor: `day-${day}`, className: "cursor-pointer", children: day })] }, day))) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-base font-semibold mb-3 block", children: "Preferred Time Slots" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: TIME_SLOTS.map((time) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: `time-${time}`, checked: preferredTimes.includes(time), onCheckedChange: () => handleTimeToggle(time) }), _jsx(Label, { htmlFor: `time-${time}`, className: "cursor-pointer", children: time })] }, time))) })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700", children: [_jsx("p", { className: "font-semibold mb-1", children: "Note:" }), _jsx("p", { children: "We'll automatically assign you a qualified teacher based on your preferences and their availability. You may not always get your exact preferred times, but we'll match you with the best available option." })] })] })] })), selectedCourseData && (_jsxs("div", { className: "flex justify-end gap-4", children: [_jsx(Button, { variant: "outline", onClick: () => setLocation("/"), children: "Cancel" }), _jsx(Button, { onClick: handleSubmit, disabled: createEnrollment.isPending, className: "bg-[#4169E1] hover:bg-[#3557c7]", children: createEnrollment.isPending ? "Processing..." : "Submit Enrollment" })] }))] }));
}
