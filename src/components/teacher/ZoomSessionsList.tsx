import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Calendar, Clock, Users, Link as LinkIcon, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function ZoomSessionsList() {
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Fetch upcoming sessions
  const { data: sessionsData, isLoading, refetch } = trpc.zoom.getUpcomingSessions.useQuery();

  // Reschedule mutation
  const reschedule = trpc.zoom.rescheduleSession.useMutation({
    onSuccess: () => {
      toast.success("Session rescheduled successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reschedule session");
    },
  });

  // Cancel mutation
  const cancel = trpc.zoom.cancelSession.useMutation({
    onSuccess: () => {
      toast.success("Session cancelled successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel session");
    },
  });

  const copyToClipboard = (text: string, sessionId: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(sessionId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

  if (sessions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
        <p className="text-gray-600">You don't have any scheduled Zoom sessions yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Zoom Sessions</h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {sessions.length} sessions
        </span>
      </div>

      <div className="grid gap-4">
        {sessions.map((session: any) => (
          <Card key={session.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Session {session.sessionNumber}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {format(new Date(session.scheduledAt), "MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {format(new Date(session.scheduledAt), "h:mm a")} ({session.duration} min)
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    Student ID: {session.studentId}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {session.status}
                </span>
              </div>
            </div>

            {session.zoomLink && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Zoom Meeting Link</p>
                    <p className="text-sm font-mono text-gray-900 truncate">{session.zoomLink}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(session.zoomLink || "", session.id)}
                    className="ml-2"
                  >
                    {copiedId === session.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {session.zoomPassword && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm text-gray-600 mb-1">Password</p>
                    <p className="text-sm font-mono text-gray-900">{session.zoomPassword}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newDate = new Date(session.scheduledAt);
                  newDate.setDate(newDate.getDate() + 1);
                  reschedule.mutate({
                    sessionId: session.id,
                    newScheduledAt: newDate,
                  });
                }}
                disabled={reschedule.isPending}
              >
                {reschedule.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Reschedule"
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to cancel this session?")) {
                    cancel.mutate({
                      sessionId: session.id,
                      reason: "Cancelled by teacher",
                    });
                  }
                }}
                disabled={cancel.isPending}
              >
                {cancel.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Cancel"
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
