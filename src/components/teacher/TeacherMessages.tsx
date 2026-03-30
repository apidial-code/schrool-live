import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TeacherMessages() {
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
        <p className="text-gray-600">You don't have any messages yet.</p>
      </div>
    );
  }

  if (selectedConversation) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{selectedConversation.subject}</h3>
          <Button variant="outline" onClick={() => setSelectedConversation(null)}>
            Back to Messages
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">From: {selectedConversation.senderName}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {format(new Date(selectedConversation.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedConversation.status === "read" 
                  ? "bg-gray-100 text-gray-700"
                  : "bg-blue-100 text-blue-700"
              }`}>
                {selectedConversation.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedConversation.content}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Reply
              </label>
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSendReply}
                disabled={sendMessage.isPending || !replyText.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendMessage.isPending ? "Sending..." : "Send Reply"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedConversation(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Messages</h3>
          <p className="text-gray-600 mt-1">{messages.length} message{messages.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="space-y-3">
        {messages.map((message: any) => (
          <Card
            key={message.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedConversation(message)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                    {message.status === "unread" && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">From: {message.senderName}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{message.content}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-gray-500">
                    {format(new Date(message.createdAt), "MMM d, yyyy")}
                  </p>
                  <Button size="sm" variant="ghost" className="mt-2">
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
