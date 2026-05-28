import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
export default function TeacherMessages() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [replyText, setReplyText] = useState("");
    const { data: messages, isLoading } = trpc.teacher.getMessages.useQuery();
    const utils = trpc.useUtils();
    const sendMessage = trpc.teacher.sendMessage.useMutation({
        onSuccess: () => {
            toast.success("Message sent successfully!");
            utils.teacher.getMessages.invalidate();
            setReplyText("");
        },
        onError: (error) => {
            toast.error(error.message || "Failed to send message");
        },
    });
    const handleSendReply = () => {
        if (!selectedConversation || !replyText.trim()) {
            toast.error("Please enter a message");
            return;
        }
        sendMessage.mutate({
            recipientId: selectedConversation.senderId,
            subject: `Re: ${selectedConversation.subject}`,
            messageText: replyText,
        });
    };
    if (isLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" }) }));
    }
    if (!messages || messages.length === 0) {
        return (_jsxs("div", { className: "text-center py-12", children: [_jsx(MessageSquare, { className: "w-16 h-16 mx-auto mb-4 text-gray-300" }), _jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Messages" }), _jsx("p", { className: "text-gray-600", children: "You don't have any messages yet." })] }));
    }
    if (selectedConversation) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: selectedConversation.subject }), _jsx(Button, { variant: "outline", onClick: () => setSelectedConversation(null), children: "Back to Messages" })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-lg", children: ["From: ", selectedConversation.senderName] }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: format(new Date(selectedConversation.createdAt), "MMM d, yyyy 'at' h:mm a") })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${selectedConversation.status === "read"
                                            ? "bg-gray-100 text-gray-700"
                                            : "bg-blue-100 text-blue-700"}`, children: selectedConversation.status })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200", children: _jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedConversation.content }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Reply" }), _jsx(Textarea, { value: replyText, onChange: (e) => setReplyText(e.target.value), placeholder: "Type your reply...", rows: 6 })] }), _jsxs("div", { className: "flex gap-3", children: [_jsxs(Button, { onClick: handleSendReply, disabled: sendMessage.isPending || !replyText.trim(), className: "bg-blue-600 hover:bg-blue-700", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), sendMessage.isPending ? "Sending..." : "Send Reply"] }), _jsx(Button, { variant: "outline", onClick: () => setSelectedConversation(null), children: "Cancel" })] })] })] })] }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h3", { className: "text-2xl font-bold text-gray-900", children: "Messages" }), _jsxs("p", { className: "text-gray-600 mt-1", children: [messages.length, " message", messages.length > 1 ? "s" : ""] })] }) }), _jsx("div", { className: "space-y-3", children: messages.map((message) => (_jsx(Card, { className: "hover:shadow-lg transition-shadow cursor-pointer", onClick: () => setSelectedConversation(message), children: _jsx(CardContent, { className: "p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-1", children: [_jsx("h4", { className: "font-semibold text-gray-900", children: message.subject }), message.status === "unread" && (_jsx("span", { className: "w-2 h-2 bg-blue-600 rounded-full" }))] }), _jsxs("p", { className: "text-sm text-gray-600 mb-1", children: ["From: ", message.senderName] }), _jsx("p", { className: "text-sm text-gray-500 line-clamp-2", children: message.content })] }), _jsxs("div", { className: "text-right ml-4", children: [_jsx("p", { className: "text-xs text-gray-500", children: format(new Date(message.createdAt), "MMM d, yyyy") }), _jsx(Button, { size: "sm", variant: "ghost", className: "mt-2", children: "View" })] })] }) }) }, message.id))) })] }));
}
