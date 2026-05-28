import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageSquare, CheckCircle2, Clock, Archive } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
export function AskQuestion() {
    const [subject, setSubject] = useState("");
    const [questionText, setQuestionText] = useState("");
    const [lessonId, setLessonId] = useState(undefined);
    const utils = trpc.useUtils();
    const { data: questions, isLoading: questionsLoading } = trpc.questions.myQuestions.useQuery();
    const { data: stats } = trpc.questions.stats.useQuery();
    const { data: lessons } = trpc.lessons.list.useQuery();
    const submitMutation = trpc.questions.submit.useMutation({
        onSuccess: () => {
            toast.success("Question submitted successfully!");
            setSubject("");
            setQuestionText("");
            setLessonId(undefined);
            utils.questions.myQuestions.invalidate();
            utils.questions.stats.invalidate();
        },
        onError: (error) => {
            toast.error(`Failed to submit question: ${error.message}`);
        },
    });
    const archiveMutation = trpc.questions.archive.useMutation({
        onSuccess: () => {
            toast.success("Question archived");
            utils.questions.myQuestions.invalidate();
            utils.questions.stats.invalidate();
        },
    });
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            toast.error("Please enter a subject");
            return;
        }
        if (!questionText.trim() || questionText.trim().length < 10) {
            toast.error("Please enter a question (at least 10 characters)");
            return;
        }
        submitMutation.mutate({
            subject: subject.trim(),
            questionText: questionText.trim(),
            lessonId,
        });
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return _jsxs(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Pending"] });
            case "answered":
                return _jsxs(Badge, { variant: "secondary", className: "bg-green-100 text-green-800", children: [_jsx(CheckCircle2, { className: "w-3 h-3 mr-1" }), "Answered"] });
            case "archived":
                return _jsxs(Badge, { variant: "secondary", className: "bg-gray-100 text-gray-800", children: [_jsx(Archive, { className: "w-3 h-3 mr-1" }), "Archived"] });
            default:
                return _jsx(Badge, { variant: "secondary", children: status });
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-gray-900", children: "Ask a Question" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Get help from your teachers" })] }) }), stats && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-blue-600", children: stats.total }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Total Questions" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-yellow-600", children: stats.pending }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Pending" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-green-600", children: stats.answered }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Answered" })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-3xl font-bold text-gray-600", children: stats.archived }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Archived" })] }) }) })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(MessageSquare, { className: "w-5 h-5" }), "Submit a New Question"] }), _jsx(CardDescription, { children: "Ask your teacher any questions about the lessons or exercises" })] }), _jsx(CardContent, { children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "lesson", children: "Related Lesson (Optional)" }), _jsxs("select", { id: "lesson", value: lessonId || "", onChange: (e) => setLessonId(e.target.value ? parseInt(e.target.value) : undefined), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "", children: "-- Select a lesson (optional) --" }), lessons?.map((lesson) => (_jsx("option", { value: lesson.id, children: lesson.title }, lesson.id)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "subject", children: "Subject *" }), _jsx(Input, { id: "subject", placeholder: "Brief description of your question", value: subject, onChange: (e) => setSubject(e.target.value), maxLength: 255, required: true })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "question", children: "Your Question *" }), _jsx(Textarea, { id: "question", placeholder: "Describe your question in detail (minimum 10 characters)", value: questionText, onChange: (e) => setQuestionText(e.target.value), rows: 6, required: true, minLength: 10 }), _jsxs("p", { className: "text-sm text-gray-500", children: [questionText.length, " characters (minimum 10 required)"] })] }), _jsx(Button, { type: "submit", disabled: submitMutation.isPending || !subject.trim() || questionText.trim().length < 10, className: "w-full", children: submitMutation.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Submitting..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Submit Question"] })) })] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Your Questions" }), _jsx(CardDescription, { children: "Track the status of your submitted questions" })] }), _jsx(CardContent, { children: questionsLoading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx(Loader2, { className: "w-6 h-6 animate-spin text-blue-600" }) })) : questions && questions.length > 0 ? (_jsx("div", { className: "space-y-4", children: questions.map((question) => (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: question.subject }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: ["Asked ", formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [getStatusBadge(question.status), question.status === "answered" && (_jsx(Button, { size: "sm", variant: "ghost", onClick: () => archiveMutation.mutate({ id: question.id }), disabled: archiveMutation.isPending, children: _jsx(Archive, { className: "w-4 h-4" }) }))] })] }), _jsx("p", { className: "text-gray-700 text-sm mb-3", children: question.questionText }), question.status === "answered" && question.responseText && (_jsxs("div", { className: "bg-green-50 border border-green-200 rounded-md p-3 mt-3", children: [_jsx("p", { className: "text-sm font-semibold text-green-900 mb-1", children: "Teacher's Response:" }), _jsx("p", { className: "text-sm text-green-800", children: question.responseText }), question.respondedAt && (_jsxs("p", { className: "text-xs text-green-600 mt-2", children: ["Answered ", formatDistanceToNow(new Date(question.respondedAt), { addSuffix: true })] }))] }))] }, question.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(MessageSquare, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }), _jsx("p", { className: "text-gray-600", children: "You haven't asked any questions yet." }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "Submit your first question above!" })] })) })] })] }));
}
