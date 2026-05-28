import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, Send, User, Eye, MessageCircle, AlertTriangle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { format } from "date-fns";
export function ParentMessages({ studentId }) {
    const [showCompose, setShowCompose] = useState(false);
    const [subject, setSubject] = useState("");
    const [messageText, setMessageText] = useState("");
    const [category, setCategory] = useState("");
    const [teacherId, setTeacherId] = useState(1); // Default teacher ID
    const { data: messages, isLoading, refetch } = trpc.parent.getMessages.useQuery();
    const sendMessage = trpc.parent.sendMessageToTeacher.useMutation({
        onSuccess: () => {
            toast.success("Message sent successfully");
            setSubject("");
            setMessageText("");
            setShowCompose(false);
            refetch();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to send message");
        },
    });
    const markRead = trpc.parent.markMessageRead.useMutation({
        onSuccess: () => {
            refetch();
        },
    });
    const handleSend = () => {
        if (!category) {
            toast.error("Please select a message category");
            return;
        }
        if (!subject.trim() || !messageText.trim()) {
            toast.error("Please fill in all fields");
            return;
        }
        sendMessage.mutate({
            teacherId,
            subject: `[${category}] ${subject}`,
            messageText,
            studentId,
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center py-12", children: _jsx(Loader2, { className: "animate-spin w-8 h-8 text-blue-700" }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Messages" }), _jsx("p", { className: "text-gray-600 mt-1", children: "View and send messages to your child's teacher" })] }), _jsxs(Button, { onClick: () => setShowCompose(!showCompose), className: "bg-blue-700 hover:bg-blue-800", children: [_jsx(Mail, { className: "w-4 h-4 mr-2" }), showCompose ? "Cancel" : "New Message"] })] }), _jsx(Card, { className: "bg-amber-50 border-amber-300", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(AlertTriangle, { className: "w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: "Emergency-Only Messaging" }), _jsx("p", { className: "text-sm text-gray-700 mb-2", children: "Parent messaging is for emergencies only. Please select the appropriate category when composing messages." }), _jsx("p", { className: "text-sm font-semibold text-amber-800", children: "\u26A0\uFE0F Abuse of messaging privileges may result in access being revoked." })] })] }) }) }), showCompose && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Compose Message" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Message Category *" }), _jsxs("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500", required: true, children: [_jsx("option", { value: "", children: "Select a category..." }), _jsx("option", { value: "Emergency/Urgent", children: "\uD83D\uDEA8 Emergency/Urgent (child sick, unable to attend)" }), _jsx("option", { value: "Scheduling Issues", children: "\uD83D\uDCC5 Scheduling Issues (session conflicts, rescheduling)" }), _jsx("option", { value: "Academic Concerns", children: "\uD83D\uDCDA Academic Concerns (homework help, learning questions)" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Subject" }), _jsx(Input, { value: subject, onChange: (e) => setSubject(e.target.value), placeholder: "Enter message subject" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Message" }), _jsx(Textarea, { value: messageText, onChange: (e) => setMessageText(e.target.value), placeholder: "Type your message here...", rows: 6 })] }), _jsx(Button, { onClick: handleSend, disabled: sendMessage.isPending, className: "w-full bg-blue-700 hover:bg-blue-800", children: sendMessage.isPending ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Sending..."] })) : (_jsxs(_Fragment, { children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Message"] })) })] })] })), _jsxs(Tabs, { defaultValue: "parent-teacher", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [_jsxs(TabsTrigger, { value: "parent-teacher", className: "flex items-center gap-2", children: [_jsx(MessageCircle, { className: "w-4 h-4" }), "Your Messages"] }), _jsxs(TabsTrigger, { value: "teacher-student", className: "flex items-center gap-2", children: [_jsx(Eye, { className: "w-4 h-4" }), "Teacher-Student Messages"] })] }), _jsx(TabsContent, { value: "parent-teacher", className: "space-y-4 mt-6", children: messages && messages.length > 0 ? (messages.map((message) => (_jsx(Card, { className: `cursor-pointer hover:shadow-lg transition-shadow ${message.isRead === 0 ? "border-blue-300 bg-blue-50" : ""}`, onClick: () => {
                                if (message.isRead === 0) {
                                    markRead.mutate({ messageId: message.id });
                                }
                            }, children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center", children: _jsx(User, { className: "w-5 h-5 text-blue-700" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-gray-900", children: message.subject }), _jsx("p", { className: "text-xs text-gray-500", children: format(new Date(message.createdAt), "PPP 'at' p") })] })] }), message.isRead === 0 && (_jsx(Badge, { className: "bg-blue-500", children: "Unread" }))] }), _jsx("p", { className: "text-gray-700 mt-3", children: message.messageText })] }) }, message.id)))) : (_jsx(Card, { children: _jsx(CardContent, { className: "py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(Mail, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Messages" }), _jsx("p", { className: "text-gray-600", children: "Start a conversation with your child's teacher using the \"New Message\" button." })] }) }) })) }), _jsxs(TabsContent, { value: "teacher-student", className: "space-y-4 mt-6", children: [_jsx(Card, { className: "bg-blue-50 border-blue-200 mb-4", children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Eye, { className: "w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-1", children: "View Teacher-Student Conversations" }), _jsx("p", { className: "text-sm text-gray-700", children: "Monitor all messages between your child and their teacher. This helps you stay informed about their learning progress and any questions they may have. These messages are read-only for parents." })] })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "py-12", children: _jsxs("div", { className: "text-center", children: [_jsx(MessageCircle, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Teacher-Student Messages" }), _jsx("p", { className: "text-gray-600", children: "Messages between your child and their teacher will appear here." })] }) }) })] })] })] }));
}
