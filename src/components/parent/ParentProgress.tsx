import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";

interface ParentProgressProps {
  studentId: number;
  studentName: string;
}

export function ParentProgress({ studentId, studentName }: ParentProgressProps) {
  const { data: progress, isLoading } = trpc.parent.getChildProgress.useQuery({ studentId });
  const { data: assignments } = trpc.parent.getChildAssignments.useQuery({ studentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  // Prepare chart data
  const completedAssignments = assignments?.filter(a => a.status === "completed") || [];
  
  const levelData = completedAssignments.map(assignment => ({
    name: assignment.title.length > 15 ? assignment.title.substring(0, 15) + "..." : assignment.title,
    Easy: assignment.easyScore,
    Medium: assignment.mediumScore,
    Challenging: assignment.challengingScore,
  }));

  const trendData = completedAssignments.map((assignment, index) => ({
    lesson: `L${index + 1}`,
    score: assignment.overallScore,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
        <p className="text-gray-600 mt-1">Detailed analysis of {studentName}'s performance</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Overall Average</p>
              <p className="text-4xl font-bold text-blue-700 mt-2">{progress?.overallAverage || 0}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Lessons Completed</p>
              <p className="text-4xl font-bold text-blue-600 mt-2">
                {progress?.completedLessons || 0}/{progress?.totalLessons || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Perfect Scores</p>
              <p className="text-4xl font-bold text-amber-600 mt-2">{progress?.perfectScores || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance by Level Chart */}
      {levelData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              Performance by Difficulty Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Easy" fill="#10b981" />
                <Bar dataKey="Medium" fill="#3b82f6" />
                <Bar dataKey="Challenging" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Progress Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-700" />
              Overall Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="lesson" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Lesson-by-Lesson Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lesson-by-Lesson Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {completedAssignments.length > 0 ? (
            <div className="space-y-4">
              {completedAssignments.map((assignment) => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{assignment.title}</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Easy</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${(assignment.easyScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{assignment.easyScore}/10</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Medium</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(assignment.mediumScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{assignment.mediumScore}/10</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Challenging</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${(assignment.challengingScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{assignment.challengingScore}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No completed lessons yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
