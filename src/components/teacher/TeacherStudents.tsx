import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Clock, Award } from "lucide-react";

export default function TeacherStudents() {
  const { data: students, isLoading } = trpc.teacher.getAssignedStudents.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Assigned Yet</h3>
        <p className="text-gray-600">Elite tier students will appear here once assigned to you.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">My Elite Students</h3>
          <p className="text-gray-600 mt-1">{students.length} student{students.length > 1 ? "s" : ""} assigned to you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {students.map((student: any) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {student.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <p className="text-sm text-gray-500">{student.email}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Overview */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-bold text-blue-600">{student.progressPercentage || 0}%</span>
                </div>
                <Progress value={student.progressPercentage || 0} className="h-2" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Completed</p>
                    <p className="font-semibold text-gray-900">{student.completedLessons || 0} lessons</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-500">Avg Score</p>
                    <p className="font-semibold text-gray-900">{student.averageScore || 0}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-500">Perfect Scores</p>
                    <p className="font-semibold text-gray-900">{student.perfectScores || 0}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Sessions</p>
                    <p className="font-semibold text-gray-900">{student.completedSessions || 0}/48</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  Message Student
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  Schedule Session
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
