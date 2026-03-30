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

interface ParentMessagesProps {
  studentId: number;
}

export function ParentMessages({ studentId }: ParentMessagesProps) {
  const [showCompose, setShowCompose] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState<string>("");
  const [teacherId, setTeacherId] = useState<number>(1); // Default teacher ID

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
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">View and send messages to your child's teacher</p>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-blue-700 hover:bg-blue-800"
        >
          <Mail className="w-4 h-4 mr-2" />
          {showCompose ? "Cancel" : "New Message"}
        </Button>
      </div>

      {/* Emergency Messaging Warning */}
      <Card className="bg-amber-50 border-amber-300">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Emergency-Only Messaging</h4>
              <p className="text-sm text-gray-700 mb-2">
                Parent messaging is for emergencies only. Please select the appropriate category when composing messages.
              </p>
              <p className="text-sm font-semibold text-amber-800">
                ⚠️ Abuse of messaging privileges may result in access being revoked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compose Message */}
      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a category...</option>
                <option value="Emergency/Urgent">🚨 Emergency/Urgent (child sick, unable to attend)</option>
                <option value="Scheduling Issues">📅 Scheduling Issues (session conflicts, rescheduling)</option>
                <option value="Academic Concerns">📚 Academic Concerns (homework help, learning questions)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter message subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={sendMessage.isPending}
              className="w-full bg-blue-700 hover:bg-blue-800"
            >
              {sendMessage.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Message Tabs */}
      <Tabs defaultValue="parent-teacher" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parent-teacher" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Your Messages
          </TabsTrigger>
          <TabsTrigger value="teacher-student" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Teacher-Student Messages
          </TabsTrigger>
        </TabsList>

        {/* Parent-Teacher Messages Tab */}
        <TabsContent value="parent-teacher" className="space-y-4 mt-6">
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Card
              key={message.id}
              className={`cursor-pointer hover:shadow-lg transition-shadow ${
                message.isRead === 0 ? "border-blue-300 bg-blue-50" : ""
              }`}
              onClick={() => {
                if (message.isRead === 0) {
                  markRead.mutate({ messageId: message.id });
                }
              }}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                      <p className="text-xs text-gray-500">
                        {format(new Date(message.createdAt), "PPP 'at' p")}
                      </p>
                    </div>
                  </div>
                  {message.isRead === 0 && (
                    <Badge className="bg-blue-500">Unread</Badge>
                  )}
                </div>
                <p className="text-gray-700 mt-3">{message.messageText}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
                <p className="text-gray-600">
                  Start a conversation with your child's teacher using the "New Message" button.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        </TabsContent>

        {/* Teacher-Student Messages Tab */}
        <TabsContent value="teacher-student" className="space-y-4 mt-6">
          <Card className="bg-blue-50 border-blue-200 mb-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">View Teacher-Student Conversations</h4>
                  <p className="text-sm text-gray-700">
                    Monitor all messages between your child and their teacher. This helps you stay informed about 
                    their learning progress and any questions they may have. These messages are read-only for parents.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teacher-Student Messages</h3>
                <p className="text-gray-600">
                  Messages between your child and their teacher will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
