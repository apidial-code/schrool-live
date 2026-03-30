import { trpc } from "@/lib/trpc";
import { Loader2, Calendar, Clock, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ParentScheduleProps {
  studentId: number;
  studentName: string;
}

export function ParentSchedule({ studentId, studentName }: ParentScheduleProps) {
  const { data: sessions, isLoading } = trpc.parent.getUpcomingSessions.useQuery({ studentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Schedule & Sessions</h1>
        <p className="text-gray-600 mt-1">Upcoming Zoom sessions for {studentName}</p>
      </div>

      {sessions && sessions.length > 0 ? (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Video className="w-8 h-8 text-blue-700" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        Session #{session.sessionNumber}
                      </h3>
                      <Badge className="bg-blue-500">Scheduled</Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(session.scheduledAt), "PPPP 'at' p")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{session.duration} minutes</span>
                      </div>
                    </div>

                    {session.zoomLink && (
                      <div className="mt-4">
                        <a
                          href={session.zoomLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Video className="w-4 h-4" />
                          Join Zoom Session
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-600">
                New sessions will appear here when scheduled by the teacher.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
