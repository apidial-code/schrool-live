import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Shield, CheckCircle, BookOpen } from "lucide-react";
export default function TeacherTraining() {
    const trainingModules = [
        {
            id: 1,
            title: "5QHackMath Methodology",
            description: "Learn the core principles of the 5QHackMath teaching approach and how to apply it effectively with students.",
            icon: GraduationCap,
            status: "required",
            duration: "30 min",
        },
        {
            id: 2,
            title: "Student Privacy and Confidentiality",
            description: "Understanding your responsibilities regarding student data protection and confidentiality in online teaching.",
            icon: Shield,
            status: "required",
            duration: "20 min",
        },
        {
            id: 3,
            title: "Basic Rules for Teachers",
            description: "Essential guidelines and policies that all SCHROOL teachers must follow to maintain quality standards.",
            icon: FileText,
            status: "required",
            duration: "15 min",
        },
        {
            id: 4,
            title: "Terms and Conditions of Employment",
            description: "Review your employment terms, remuneration structure, and contractual obligations.",
            icon: BookOpen,
            status: "required",
            duration: "25 min",
        },
    ];
    const guidelines = [
        {
            title: "Response Time",
            description: "Respond to student questions within 12 hours",
            icon: "⏰",
        },
        {
            title: "Assignment Grading",
            description: "Grade all assignments within 48 hours of submission",
            icon: "📝",
        },
        {
            title: "Session Preparation",
            description: "Review student progress before each Zoom session",
            icon: "📊",
        },
        {
            title: "Professional Conduct",
            description: "Maintain professional communication with students and parents",
            icon: "🤝",
        },
        {
            title: "Attendance",
            description: "Conduct 2 Zoom sessions per week per Elite student",
            icon: "📅",
        },
        {
            title: "Feedback Quality",
            description: "Provide detailed, constructive feedback on all assignments",
            icon: "💬",
        },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Teacher Training & Guidelines" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Complete required training modules and review teaching guidelines" })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Required Training Modules" }), _jsx("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: trainingModules.map((module) => {
                            const Icon = module.icon;
                            return (_jsxs(Card, { className: "hover:shadow-lg transition-shadow", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0", children: _jsx(Icon, { className: "w-5 h-5 text-blue-600" }) }), _jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: module.title }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: module.duration })] })] }), _jsx("span", { className: "px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded", children: "Required" })] }) }), _jsxs(CardContent, { className: "space-y-3", children: [_jsx("p", { className: "text-sm text-gray-600", children: module.description }), _jsx(Button, { className: "w-full bg-blue-600 hover:bg-blue-700", children: "Start Module" })] })] }, module.id));
                        }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-5 h-5 text-green-600" }), "Teaching Guidelines & Best Practices"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: guidelines.map((guideline, index) => (_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-100", children: [_jsx("div", { className: "text-2xl mb-2", children: guideline.icon }), _jsx("h5", { className: "font-semibold text-gray-900 mb-1", children: guideline.title }), _jsx("p", { className: "text-sm text-gray-600", children: guideline.description })] }, index))) }) })] }), _jsxs(Card, { className: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "text-blue-900", children: "Quick Reference" }) }), _jsxs(CardContent, { className: "space-y-2 text-sm text-blue-800", children: [_jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Elite Students:" }), " 2 Zoom sessions per week (48 total sessions)"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Session Duration:" }), " 60 minutes per session"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Assignment Turnaround:" }), " 48 hours maximum"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Question Response:" }), " Within 12 hours"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Professionalism:" }), " Always maintain professional communication"] }), _jsxs("p", { children: ["\u2022 ", _jsx("strong", { children: "Privacy:" }), " Never share student information with unauthorized parties"] })] })] })] }));
}
