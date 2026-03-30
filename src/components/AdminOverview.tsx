import { trpc } from "@/lib/trpc";
import { Users, GraduationCap, UserCheck, DollarSign, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function AdminOverview() {
  const { data: stats, isLoading } = trpc.admin.getDashboardStats.useQuery();
  const { data: recentActivity } = trpc.admin.getRecentActivity.useQuery({ limit: 10 });

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard statistics...</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Students",
      value: stats?.activeStudents || 0,
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Teachers",
      value: stats?.activeTeachers || 0,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Enrollments",
      value: stats?.totalEnrollments || 0,
      icon: DollarSign,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Pending Teachers",
      value: stats?.pendingTeachers || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentActivity || recentActivity.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity</p>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-500">
                      {activity.user.email} • {activity.user.role}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
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
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Create User</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Review Teachers</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Process Payments</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
