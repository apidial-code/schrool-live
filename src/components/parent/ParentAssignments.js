import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { trpc } from "@/lib/trpc";
import { Loader2, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
export function ParentAssignments({ studentId, studentName }) {
    const { data: assignments, isLoading } = trpc.parent.getChildAssignments.useQuery({ studentId });
    const { data: questions } = trpc.parent.getChildQuestions.useQuery({ studentId });
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-700" }) }));
    }
    const getStatusBadge = (status) => {
        switch (status) {
            case "completed":
                return _jsx(Badge, { className: "bg-green-500", children: "Completed" });
            case "in_progress":
                return _jsx(Badge, { className: "bg-blue-500", children: "In Progress" });
            case "upcoming":
                return _jsx(Badge, { className: "bg-gray-400", children: "Upcoming" });
            default:
                return null;
        }
    };
    const getScoreColor = (score) => {
        if (score >= 8)
            return "text-green-600";
        if (score >= 6)
            return "text-blue-600";
        return "text-gray-600";
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: [studentName, "'s Assignment Progress"] }), _jsx("p", { className: "text-gray-600 mt-1", children: "Track all assignments and scores" })] }), _jsxs(Button, { className: "bg-blue-700 hover:bg-blue-800", children: [_jsx(Download, { className: "w-4 h-4 mr-2" }), "Download Report"] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "All Assignments" }) }), _jsx(CardContent, { children: assignments && assignments.length > 0 ? (_jsx("div", { className: "space-y-4", children: assignments.map((assignment) => (_jsxs("div", { className: "flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "font-semibold text-gray-900", children: assignment.title }), getStatusBadge(assignment.status)] }), _jsx("p", { className: "text-sm text-gray-600", children: assignment.description }), assignment.status === "completed" && (_jsxs("div", { className: "flex items-center gap-4 mt-2 text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Easy: ", _jsxs("span", { className: getScoreColor(assignment.easyScore), children: [assignment.easyScore, "/10"] })] }), _jsxs("span", { className: "text-gray-600", children: ["Medium: ", _jsxs("span", { className: getScoreColor(assignment.mediumScore), children: [assignment.mediumScore, "/10"] })] }), _jsxs("span", { className: "text-gray-600", children: ["Challenging: ", _jsxs("span", { className: getScoreColor(assignment.challengingScore), children: [assignment.challengingScore, "/10"] })] })] })), assignment.completedAt && (_jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Completed: ", format(new Date(assignment.completedAt), "PPP")] }))] }), assignment.status === "completed" && (_jsxs("div", { className: "text-right ml-4", children: [_jsxs("div", { className: `text-3xl font-bold ${assignment.overallScore >= 8 ? 'text-green-600' : assignment.overallScore >= 6 ? 'text-blue-600' : 'text-gray-600'}`, children: [assignment.overallScore, "/10"] }), _jsx("p", { className: "text-xs text-gray-500", children: "Overall" })] }))] }, assignment.id))) })) : (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No assignments yet" })) })] }), questions && questions.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: [studentName, "'s Question Creation Examples"] }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: questions.slice(0, 3).map((question) => (_jsxs("div", { className: "bg-gray-50 p-4 rounded-lg", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: question.subject }), _jsx(Badge, { variant: question.status === "answered" ? "default" : "secondary", children: question.status })] }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: question.questionText }), question.responseText && (_jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200", children: [_jsx("p", { className: "text-xs font-semibold text-gray-600 mb-1", children: "Teacher Response:" }), _jsx("p", { className: "text-sm text-gray-700", children: question.responseText })] })), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: format(new Date(question.createdAt), "PPP") })] }, question.id))) }) })] }))] }));
}
