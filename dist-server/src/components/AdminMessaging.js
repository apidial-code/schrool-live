import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Mail } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
export default function AdminMessaging() {
    const [subject, setSubject] = useState("");
    const [messageText, setMessageText] = useState("");
    const [recipients, setRecipients] = useState("all");
    const { data: allMessages } = trpc.admin.getAllMessages.useQuery({ limit: 50 });
    const sendBroadcastMutation = trpc.admin.sendBroadcastMessage.useMutation({
        onSuccess: () => {
            setSubject("");
            setMessageText("");
            alert("Message sent successfully!");
        },
    });
    const handleSendBroadcast = async () => {
        if (!subject || !messageText) {
            alert("Please fill in all fields");
            return;
        }
        await sendBroadcastMutation.mutateAsync({
            subject,
            messageText,
            recipients,
        });
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Broadcast Message" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Recipients" }), _jsxs("select", { value: recipients, onChange: (e) => setRecipients(e.target.value), className: "w-full px-4 py-2 border rounded-lg", children: [_jsx("option", { value: "all", children: "All Users" }), _jsx("option", { value: "students", children: "Students Only" }), _jsx("option", { value: "parents", children: "Parents Only" }), _jsx("option", { value: "teachers", children: "Teachers Only" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Subject" }), _jsx(Input, { placeholder: "Message subject...", value: subject, onChange: (e) => setSubject(e.target.value) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Message" }), _jsx(Textarea, { placeholder: "Type your message here...", value: messageText, onChange: (e) => setMessageText(e.target.value), rows: 6 })] }), _jsxs(Button, { onClick: handleSendBroadcast, disabled: sendBroadcastMutation.isPending, className: "w-full", children: [_jsx(Send, { className: "w-4 h-4 mr-2" }), "Send Broadcast Message"] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "All Messages" }) }), _jsx(CardContent, { children: !allMessages || allMessages.length === 0 ? (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No messages found" })) : (_jsx("div", { className: "space-y-3", children: allMessages.map((message) => (_jsxs("div", { className: "border rounded-lg p-4 hover:bg-gray-50", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Mail, { className: "w-4 h-4 text-gray-400" }), _jsx("span", { className: "font-semibold", children: message.subject })] }), _jsx("span", { className: `px-2 py-1 text-xs rounded-full ${message.isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"}`, children: message.isRead ? "Read" : "Unread" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: message.messageText }), _jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("span", { children: ["From: User #", message.senderId] }), _jsxs("span", { children: ["To: User #", message.recipientId] }), _jsx("span", { children: new Date(message.createdAt).toLocaleString() })] })] }, message.id))) })) })] })] }));
}
