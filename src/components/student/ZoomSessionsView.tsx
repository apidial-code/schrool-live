import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function ZoomSessionsView() {
  const { data: sessionsData, isLoading } = trpc.zoom.getUpcomingSessions.useQuery();

  const handleJoinMeeting = (zoomLink: string) => {
    if (zoomLink) {
      window.open(zoomLink, "_blank");
      toast.success("Opening Zoom meeting...");
    }
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
      <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Zoom Sessions Scheduled</h3>
        <p className="text-gray-600">
          Your Elite Zoom sessions will appear here once they're scheduled by your teacher.
        </p>
      </Card>
    );
  }

  // Separate upcoming and past sessions
  const now = new Date();
  const upcomingSessions = sessions.filter((s: any) => new Date(s.scheduledAt) > now);
  const pastSessions = sessions.filter((s: any) => new Date(s.scheduledAt) <= now);

  return (
    <div className="space-y-6">
      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="grid gap-4">
            {upcomingSessions.map((session: any) => (
              <Card key={session.id} className="p-6 border-l-4 border-l-blue-600 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Elite Zoom Session {session.sessionNumber}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                        {format(new Date(session.scheduledAt), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-blue-600" />
                        {format(new Date(session.scheduledAt), "h:mm a")} ({session.duration} minutes)
                      </div>
                    </div>
                  </div>
                  {session.zoomLink && (
                    <Button
                      onClick={() => handleJoinMeeting(session.zoomLink || "")}
                      className="bg-blue-600 hover:bg-blue-700 text-white ml-4"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Meeting
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Sessions</h2>
          <div className="grid gap-4">
            {pastSessions.map((session: any) => (
              <Card key={session.id} className="p-6 opacity-75 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">
                      Session {session.sessionNumber} - Completed
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(session.scheduledAt), "MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {format(new Date(session.scheduledAt), "h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Completed
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
