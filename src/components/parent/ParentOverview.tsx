import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, Target, Trophy, Calendar, Star, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ParentOverviewProps {
  studentId: number;
  studentName: string;
}

export function ParentOverview({ studentId, studentName }: ParentOverviewProps) {
  const [, setLocation] = useLocation();
  const { data: progress, isLoading: progressLoading } = trpc.parent.getChildProgress.useQuery({ studentId });
  const { data: activity, isLoading: activityLoading } = trpc.parent.getChildActivity.useQuery({ studentId, limit: 5 });
  const { data: sessions } = trpc.parent.getUpcomingSessions.useQuery({ studentId });

  const handleTryLessons = () => {
    toast.success("Practice Mode activated! Your progress won't affect " + studentName + "'s records.");
    // In a real implementation, this would set a practice mode flag
    // and navigate to lessons with isolated progress tracking
    setLocation("/student"); // For demo, navigate to student dashboard
  };

  if (progressLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  const nextSession = sessions && sessions.length > 0 ? sessions[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoring {studentName}'s 5QHackMath Progress</p>
        </div>
        <Button 
          onClick={handleTryLessons}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Try Lessons Yourself
        </Button>
      </div>

      {/* Practice Mode Info Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-6 h-6 text-purple-700 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Isolated Practice Mode</h4>
              <p className="text-gray-700">
                Want to help {studentName} with their lessons? Click "Try Lessons Yourself" to access any lesson in practice mode. 
                Your progress will be tracked separately and won't affect {studentName}'s records or unlock status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Alert */}
      {progress && progress.perfectScores > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Star className="w-6 h-6 text-blue-700 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Great News!</h4>
                <p className="text-gray-700">
                  {studentName} has achieved {progress.perfectScores} perfect score{progress.perfectScores > 1 ? 's' : ''}! 
                  They're showing excellent progress in the 5QHackMath methodology!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Overall Average</p>
                <p className="text-3xl font-bold mt-1">{progress?.overallAverage || 0}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Topics Completed</p>
                <p className="text-3xl font-bold mt-1">{progress?.completedLessons || 0}</p>
              </div>
              <Target className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Perfect Scores</p>
                <p className="text-3xl font-bold mt-1">{progress?.perfectScores || 0}</p>
              </div>
              <Trophy className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Weeks Completed</p>
                <p className="text-3xl font-bold mt-1">{progress?.weeksCompleted || 0}</p>
              </div>
              <Calendar className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Progress & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-700" />
              Course Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Progress Ring */}
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    fill="none"
                    stroke="#0d9488"
                    strokeWidth="8"
                    strokeDasharray={`${(progress?.progressPercentage || 0) * 3.27} 327`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-700">
                    {progress?.progressPercentage || 0}%
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-center">
                {progress?.completedLessons || 0} of {progress?.totalLessons || 0} lessons completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin w-6 h-6 text-blue-700" />
              </div>
            ) : activity && activity.length > 0 ? (
              <ul className="space-y-3">
                {activity.map((item, index) => (
                  <li key={index} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="font-medium text-gray-900">{item.lessonTitle}</p>
                    <p className="text-sm text-gray-600">
                      {item.type === "completed" ? "Completed" : "Attempted"} • 
                      Score: {item.score}/{item.total}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.timestamp ? format(new Date(item.timestamp), "PPp") : "Recently"}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      {nextSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-950 mb-2">Next Zoom Session</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p><strong>Date:</strong> {format(new Date(nextSession.scheduledAt), "PPPP 'at' p")}</p>
                <p><strong>Duration:</strong> {nextSession.duration} minutes</p>

              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
