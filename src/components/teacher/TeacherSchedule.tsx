import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Users } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function TeacherSchedule() {
  const { data: sessions, isLoading } = trpc.teacher.getUpcomingSessions.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Session Schedule</h3>
          <p className="text-gray-600 mt-1">Manage your Zoom sessions with Elite students</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Set Availability
        </Button>
      </div>

      {/* Weekly Calendar View */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>This Week's Sessions</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(weekStart, "MMM d")} - {format(addDays(weekStart, 6), "MMM d, yyyy")}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const isToday = format(day, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
              const daySessions = sessions?.filter((s: any) =>
                format(new Date(s.scheduledAt), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
              ) || [];

              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    isToday ? "bg-blue-50 border-blue-300" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="text-center mb-2">
                    <p className="text-xs font-medium text-gray-600">{format(day, "EEE")}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-blue-600" : "text-gray-900"}`}>
                      {format(day, "d")}
                    </p>
                  </div>
                  <div className="space-y-1">
                    {daySessions.map((session: any) => (
                      <div
                        key={session.id}
                        className="text-xs p-1 bg-blue-100 rounded text-blue-900 truncate"
                        title={`${session.studentName} - ${format(new Date(session.scheduledAt), "h:mm a")}`}
                      >
                        {format(new Date(session.scheduledAt), "h:mm a")}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Sessions List */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No upcoming sessions scheduled</p>
              <p className="text-sm mt-1">Sessions will appear here once students book them</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((session: any) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                      {session.studentName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.studentName}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(session.scheduledAt), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.scheduledAt), "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Session #{session.sessionNumber}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{session.duration} min</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Video className="w-4 h-4 mr-1" />
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Management */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Availability Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Set your weekly availability to allow students to book sessions</p>
          <p>• Each Elite student requires 2 sessions per week</p>
          <p>• Sessions are 60 minutes each</p>
          <p>• Students can book sessions within your available time slots</p>
          <p>• You'll receive notifications 24 hours before each session</p>
        </CardContent>
      </Card>
    </div>
  );
}
