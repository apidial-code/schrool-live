import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown, Award } from "lucide-react";

export default function TeacherAnalytics() {
  const { data: analytics, isLoading } = trpc.teacher.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const stats = analytics || {
    averageStudentProgress: 0,
    averageAssignmentScore: 0,
    totalSessionsCompleted: 0,
    studentPerformance: [],
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Student Analytics</h3>
        <p className="text-gray-600 mt-1">Track performance metrics across your Elite students</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Student Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.averageStudentProgress}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Assignment Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.averageAssignmentScore}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-3xl font-bold text-gray-900">{stats.totalSessionsCompleted}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Total Zoom sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {!stats.studentPerformance || stats.studentPerformance.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No performance data available yet</p>
              <p className="text-sm mt-1">Data will appear as students complete lessons and assignments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Progress</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg Score</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Sessions</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.studentPerformance.map((student: any, index: number) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{student.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-gray-900">{student.progress}%</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-semibold ${
                          student.averageScore >= 80 ? "text-green-600" :
                          student.averageScore >= 60 ? "text-orange-600" :
                          "text-red-600"
                        }`}>
                          {student.averageScore}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="text-gray-700">{student.sessionsCompleted}/48</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        {student.trend === "up" ? (
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto" />
                        ) : student.trend === "down" ? (
                          <TrendingDown className="w-5 h-5 text-red-600 mx-auto" />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• Students with scores below 60% may need additional support</p>
          <p>• Downward trends indicate students who may be struggling with recent material</p>
          <p>• Maintain regular communication with parents of underperforming students</p>
          <p>• Consider scheduling extra sessions for students falling behind</p>
        </CardContent>
      </Card>
    </div>
  );
}
