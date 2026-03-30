import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Send, Mail, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminMessaging() {
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [recipients, setRecipients] = useState<"all" | "students" | "parents" | "teachers">("all");

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

  return (
    <div className="space-y-6">
      {/* Broadcast Message */}
      <Card>
        <CardHeader>
          <CardTitle>Broadcast Message</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recipients</label>
              <select
                value={recipients}
                onChange={(e) => setRecipients(e.target.value as any)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="all">All Users</option>
                <option value="students">Students Only</option>
                <option value="parents">Parents Only</option>
                <option value="teachers">Teachers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                placeholder="Message subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <Textarea
                placeholder="Type your message here..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={6}
              />
            </div>

            <Button
              onClick={handleSendBroadcast}
              disabled={sendBroadcastMutation.isPending}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Broadcast Message
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* All Messages */}
      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {!allMessages || allMessages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No messages found</p>
          ) : (
            <div className="space-y-3">
              {allMessages.map((message: any) => (
                <div key={message.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{message.subject}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.isRead ? "bg-gray-100 text-gray-600" : "bg-blue-100 text-blue-600"
                    }`}>
                      {message.isRead ? "Read" : "Unread"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{message.messageText}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>From: User #{message.senderId}</span>
                    <span>To: User #{message.recipientId}</span>
                    <span>{new Date(message.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
