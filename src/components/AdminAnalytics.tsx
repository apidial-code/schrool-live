import { trpc } from "@/lib/trpc";
import { TrendingUp, Users, DollarSign, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery({ period: "month" });

  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics?.enrollmentTrends?.map((trend: any) => (
              <div key={trend.tier} className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 capitalize">{trend.tier} Tier</p>
                    <p className="text-3xl font-bold text-blue-600">{trend.count}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Lessons</p>
                <p className="text-4xl font-bold text-green-600">
                  {analytics?.progressStats?.completed || 0}
                </p>
              </div>
              <GraduationCap className="w-12 h-12 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teacher Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {!analytics?.teacherStats || analytics.teacherStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No teacher data available</p>
          ) : (
            <div className="space-y-3">
              {analytics.teacherStats.map((stat: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">Teacher #{stat.teacherId || "Unassigned"}</p>
                      <p className="text-sm text-gray-500">{stat.studentCount} students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-purple-600">{stat.studentCount}</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-yellow-600">$0.00</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-green-600">0%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
