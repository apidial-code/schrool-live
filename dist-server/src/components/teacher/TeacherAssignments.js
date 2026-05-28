import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export default function TeacherAssignments() {
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");
    const { data: assignments, isLoading } = trpc.teacher.getPendingAssignments.useQuery();
    const utils = trpc.useUtils();
    const gradeAssignment = trpc.teacher.gradeAssignment.useMutation({
        onSuccess: () => {
            toast.success("Assignment graded successfully!");
            utils.teacher.getPendingAssignments.invalidate();
            setSelectedAssignment(null);
            setGrade("");
            setFeedback("");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to grade assignment");
        },
    });
    const handleGradeSubmit = () => {
        if (!selectedAssignment)
            return;
        if (!grade || isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
            toast.error("Please enter a valid grade (0-100)");
            return;
        }
        gradeAssignment.mutate({
            assignmentId: selectedAssignment.id,
            grade: Number(grade),
            ...(feedback ? { feedback } : {}),
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" }) }));
    }
    if (!assignments || assignments.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(CheckCircle, { className: "w-16 h-16 mx-auto mb-4 text-green-500" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "All Caught Up!" }), _jsx("p", { className: "text-gray-600", children: "No pending assignments to grade at the moment." })] }));
    }
    if (selectedAssignment) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Grade Assignment" }), _jsx(Button, { variant: "outline", onClick: () => setSelectedAssignment(null), children: "Back to List" })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: selectedAssignment.title }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600 mt-2", children: [_jsxs("span", { children: ["Student: ", selectedAssignment.studentName] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Submitted: ", format(new Date(selectedAssignment.submittedAt), "MMM d, yyyy 'at' h:mm a")] })] })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Student's Work:" }), _jsx("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200", children: _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedAssignment.content }) })] }), _jsxs("div", { children: [_jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: ["Grade (0-100) ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx(Input, { type: "number", min: "0", max: "100", value: grade, onChange: (e) => setGrade(e.target.value), placeholder: "Enter grade", className: "max-w-xs" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Feedback (Optional)" }), _jsx(Textarea, { value: feedback, onChange: (e) => setFeedback(e.target.value), placeholder: "Provide feedback to help the student improve...", rows: 6 })] }), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: handleGradeSubmit, disabled: gradeAssignment.isPending, className: "bg-blue-600 hover:bg-blue-700", children: gradeAssignment.isPending ? "Submitting..." : "Submit Grade" }), _jsx(Button, { variant: "outline", onClick: () => setSelectedAssignment(null), children: "Cancel" })] })] })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Pending Assignments" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [assignments.length, " assignment", assignments.length > 1 ? "s" : "", " awaiting your review"] })] }) }), _jsx("div", { className: "space-y-4", children: assignments.map((assignment) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-lg text-gray-900 mb-1", children: assignment.title }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ClipboardList, { className: "w-4 h-4" }), assignment.studentName] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "w-4 h-4" }), "Submitted ", format(new Date(assignment.submittedAt), "MMM d, yyyy")] })] }), assignment.daysWaiting > 1 && (_jsxs("div", { className: "flex items-center gap-1 mt-2 text-orange-600", children: [_jsx(AlertCircle, { className: "w-4 h-4" }), _jsxs("span", { className: "text-sm", children: ["Waiting ", assignment.daysWaiting, " days"] })] }))] }), _jsx(Button, { onClick: () => setSelectedAssignment(assignment), children: "Grade Assignment" })] }) }) }, assignment.id))) })] }));
}
