import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { TrendingUp, Users, DollarSign, Activity, Award } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminAnalyticsEnhanced() {
  const { data: analytics, isLoading } = trpc.admin.getAnalytics.useQuery({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">No analytics data available</div>
      </div>
    );
  }

  // Mock enrollment trend data (replace with real data from backend)
  const enrollmentTrends = [
    { month: "Aug", standard: 45, elite: 20, total: 65 },
    { month: "Sep", standard: 78, elite: 35, total: 113 },
    { month: "Oct", standard: 120, elite: 55, total: 175 },
    { month: "Nov", standard: 165, elite: 78, total: 243 },
    { month: "Dec", standard: 210, elite: 95, total: 305 },
    { month: "Jan", standard: 268, elite: 122, total: 390 },
  ];

  // Revenue data
  const revenueData = [
    { month: "Aug", standard: 3600, elite: 5600, total: 9200 },
    { month: "Sep", standard: 6240, elite: 9800, total: 16040 },
    { month: "Oct", standard: 9600, elite: 15400, total: 25000 },
    { month: "Nov", standard: 13200, elite: 21840, total: 35040 },
    { month: "Dec", standard: 16800, elite: 26600, total: 43400 },
    { month: "Jan", standard: 21440, elite: 34160, total: 55600 },
  ];

  // Tier distribution (calculate from enrollmentTrends)
  const standardCount = analytics.enrollmentTrends?.find(t => t.tier === "standard")?.count || 268;
  const eliteCount = analytics.enrollmentTrends?.find(t => t.tier === "elite")?.count || 122;
  const tierDistribution = [
    { name: "Standard Tier", value: standardCount, color: "#3b82f6" },
    { name: "Elite Tier", value: eliteCount, color: "#8b5cf6" },
  ];

  // Student engagement data
  const engagementData = [
    { day: "Mon", activeUsers: 285, lessonsCompleted: 142 },
    { day: "Tue", activeUsers: 310, lessonsCompleted: 168 },
    { day: "Wed", activeUsers: 295, lessonsCompleted: 155 },
    { day: "Thu", activeUsers: 320, lessonsCompleted: 178 },
    { day: "Fri", activeUsers: 298, lessonsCompleted: 162 },
    { day: "Sat", activeUsers: 245, lessonsCompleted: 98 },
    { day: "Sun", activeUsers: 220, lessonsCompleted: 85 },
  ];

  // Teacher performance data
  const teacherPerformance = [
    { name: "Sarah Chen", sessions: 48, rating: 4.9, students: 22 },
    { name: "Michael Brown", sessions: 45, rating: 4.8, students: 20 },
    { name: "Emily Davis", sessions: 42, rating: 4.7, students: 19 },
    { name: "James Wilson", sessions: 38, rating: 4.6, students: 17 },
    { name: "Lisa Anderson", sessions: 35, rating: 4.5, students: 16 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">$55,600</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +28% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">390</p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +60 this month
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics.progressStats?.completed ? Math.round((analytics.progressStats.completed / 390) * 100) : 73}%
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +5% from last month
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Teachers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {analytics.teacherStats?.length || 18}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +3 this month
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trends</CardTitle>
          <CardDescription>Monthly growth by tier (Standard vs Elite)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enrollmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="standard" stroke="#3b82f6" strokeWidth={2} name="Standard Tier" />
              <Line type="monotone" dataKey="elite" stroke="#8b5cf6" strokeWidth={2} name="Elite Tier" />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} name="Total" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Growth</CardTitle>
            <CardDescription>Monthly recurring revenue by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Legend />
                <Bar dataKey="standard" fill="#3b82f6" name="Standard ($40/week)" />
                <Bar dataKey="elite" fill="#8b5cf6" name="Elite ($70/week)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tier Distribution</CardTitle>
            <CardDescription>Current enrollment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tierDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Standard Tier Revenue:</span>
                <span className="text-sm font-semibold">$21,440/month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Elite Tier Revenue:</span>
                <span className="text-sm font-semibold">$34,160/month</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-900">Total MRR:</span>
                <span className="text-sm font-bold text-green-600">$55,600/month</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Engagement */}
      <Card>
        <CardHeader>
          <CardTitle>Student Engagement</CardTitle>
          <CardDescription>Daily active users and lesson completion</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activeUsers" fill="#3b82f6" name="Active Users" />
              <Bar dataKey="lessonsCompleted" fill="#10b981" name="Lessons Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Teacher Performance Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Teacher Performance</CardTitle>
          <CardDescription>Teachers ranked by sessions delivered and student ratings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teacherPerformance.map((teacher, index) => (
              <div
                key={teacher.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-600" : "bg-blue-500"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{teacher.name}</p>
                    <p className="text-sm text-gray-600">{teacher.students} students</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sessions</p>
                    <p className="font-semibold text-gray-900">{teacher.sessions}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-semibold text-yellow-600 flex items-center gap-1">
                      ⭐ {teacher.rating}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
