import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
const YEAR_LEVELS = ["Year 5/6", "Year 7", "Year 8", "Year 9"];
export default function TeacherApplication() {
    const [, setLocation] = useLocation();
    const [qualifications, setQualifications] = useState("");
    const [experience, setExperience] = useState("");
    const [bio, setBio] = useState("");
    const [timezone, setTimezone] = useState("UTC");
    const [specializations, setSpecializations] = useState([]);
    const applyMutation = trpc.teacher.applyAsTeacher.useMutation({
        onSuccess: () => {
            toast.success("Application submitted successfully! We'll review it soon.");
            setLocation("/dashboard");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to submit application");
        },
    });
    const handleSpecializationToggle = (level) => {
        setSpecializations((prev) => prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (specializations.length === 0) {
            toast.error("Please select at least one specialization");
            return;
        }
        applyMutation.mutate({
            qualifications,
            experience,
            bio,
            timezone,
            specializations: specializations,
        });
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: _jsx("div", { className: "container max-w-3xl", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-3xl", children: "Apply to Become a Teacher" }), _jsx(CardDescription, { children: "Join our team of expert mathematics educators and help transform struggling students into confident learners using the 5QHackMath method." })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "qualifications", children: ["Qualifications ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Textarea, { id: "qualifications", value: qualifications, onChange: (e) => setQualifications(e.target.value), placeholder: "List your educational qualifications, certifications, and relevant credentials...", required: true, rows: 4, minLength: 10 }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Minimum 10 characters" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "experience", children: ["Teaching Experience ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Textarea, { id: "experience", value: experience, onChange: (e) => setExperience(e.target.value), placeholder: "Describe your teaching experience, years taught, student age groups, subjects, and teaching methods...", required: true, rows: 4, minLength: 10 }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Minimum 10 characters" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs(Label, { children: ["Year Level Specializations ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Select the year levels you're qualified to teach (select at least one)" }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: YEAR_LEVELS.map((level) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: level, checked: specializations.includes(level), onCheckedChange: () => handleSpecializationToggle(level) }), _jsx(Label, { htmlFor: level, className: "cursor-pointer font-normal", children: level })] }, level))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs(Label, { htmlFor: "timezone", children: ["Timezone ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("select", { id: "timezone", value: timezone, onChange: (e) => setTimezone(e.target.value), className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", required: true, children: TIMEZONES.map((tz) => (_jsx("option", { value: tz, children: tz }, tz))) }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Your primary timezone for teaching availability" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "bio", children: "Bio (Optional)" }), _jsx(Textarea, { id: "bio", value: bio, onChange: (e) => setBio(e.target.value), placeholder: "Tell us about yourself, your teaching philosophy, and why you want to join SCHROOL...", rows: 4 })] }), _jsxs("div", { className: "flex gap-4", children: [_jsxs(Button, { type: "submit", disabled: applyMutation.isPending, className: "flex-1", children: [applyMutation.isPending && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Submit Application"] }), _jsx(Button, { type: "button", variant: "outline", onClick: () => setLocation("/dashboard"), disabled: applyMutation.isPending, children: "Cancel" })] }), _jsx("p", { className: "text-sm text-muted-foreground text-center", children: "After submitting, our admin team will review your application. You'll be notified via email once approved." })] }) })] }) }) }));
}
