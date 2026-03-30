import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ClipboardList, MessageSquare, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function TeacherOverview() {
  // DEMO MODE: Use static demo data instead of API calls
  const isDemoMode = true;

  const demoStats = {
    totalStudents: 5,
    pendingAssignments: 3,
    unreadMessages: 2,
    todaySessions: 2,
  };

  const demoTodaySessions = [
    {
      id: 1,
      studentName: "Alex Chen",
      startTime: new Date(new Date().setHours(15, 0, 0, 0)),
      endTime: new Date(new Date().setHours(16, 0, 0, 0)),
      zoomLink: "https://zoom.us/j/demo123",
      status: "scheduled",
    },
    {
      id: 2,
      studentName: "Emma Wilson",
      startTime: new Date(new Date().setHours(17, 0, 0, 0)),
      endTime: new Date(new Date().setHours(18, 0, 0, 0)),
      zoomLink: "https://zoom.us/j/demo456",
      status: "scheduled",
    },
  ];

  const demoPendingAssignments = [
    {
      id: 1,
      studentName: "Alex Chen",
      title: "Fractions Practice Set",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 2,
      studentName: "Emma Wilson",
      title: "Decimals Worksheet",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      id: 3,
      studentName: "Liam Brown",
      title: "Percentages Quiz",
      submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  // Use API calls only if not in demo mode
  const { data: stats, isLoading: statsLoading } = trpc.teacher.getDashboardStats.useQuery(undefined, {
    enabled: !isDemoMode,
  });
  const { data: todaySessions, isLoading: sessionsLoading } = trpc.teacher.getTodaySessions.useQuery(undefined, {
    enabled: !isDemoMode,
  });
  const { data: pendingAssignments } = trpc.teacher.getPendingAssignments.useQuery(undefined, {
    enabled: !isDemoMode,
  });

  // Use demo data if in demo mode, otherwise use API data
  const displayStats = isDemoMode ? demoStats : stats;
  const displayTodaySessions = isDemoMode ? demoTodaySessions : todaySessions;
  const displayPendingAssignments = isDemoMode ? demoPendingAssignments : pendingAssignments;

  if (!isDemoMode && (statsLoading || sessionsLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Welcome back, Teacher!</h3>
        <p className="text-gray-600 mt-1">Here's what's happening with your Elite students today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{displayStats?.totalStudents || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Elite tier students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-orange-600" />
              <span className="text-3xl font-bold text-gray-900">{displayStats?.pendingAssignments || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting grading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{displayStats?.unreadMessages || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">From students & parents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{(displayStats as any)?.todaySessions || 0}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Zoom sessions scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Zoom Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayTodaySessions && displayTodaySessions.length > 0 ? (
            <div className="space-y-3">
              {displayTodaySessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {(session.studentName ?? "").charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{session.studentName ?? ""}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format((session as any).startTime ?? (session as any).scheduledAt ?? new Date() ?? new Date(), "h:mm a")} - {format((session as any).endTime ?? new Date(((session as any).scheduledAt?.getTime?.() ?? 0) + (session as any).duration * 60000) ?? new Date(), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Join Zoom
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No sessions scheduled for today</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Pending Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayPendingAssignments && displayPendingAssignments.length > 0 ? (
            <div className="space-y-3">
              {displayPendingAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{assignment.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span>{assignment.studentName}</span>
                      <span>•</span>
                      <span>Submitted {format(assignment.submittedAt ?? new Date(), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Grade
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No pending assignments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Users className="w-6 h-6" />
              <span>View All Students</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Schedule Session</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
              <MessageSquare className="w-6 h-6" />
              <span>Send Message</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
