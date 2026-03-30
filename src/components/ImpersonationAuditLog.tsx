import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Shield, Calendar, Clock, User, Filter } from "lucide-react";

export default function ImpersonationAuditLog() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "parent" | "teacher" | "admin" | undefined>();

  const { data: logs, isLoading, refetch } = trpc.admin.getImpersonationLogs.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    targetUserRole: selectedRole,
    limit: 100,
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "In Progress";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "teacher":
        return "bg-purple-100 text-purple-800";
      case "parent":
        return "bg-green-100 text-green-800";
      case "student":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle>Impersonation Audit Log</CardTitle>
          </div>
          <CardDescription>
            Track all admin impersonation events for security and compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Filter className="inline h-4 w-4 mr-1" />
                  Target Role
                </label>
                <select
                  value={selectedRole || ""}
                  onChange={(e) => setSelectedRole(e.target.value as any || undefined)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">All Roles</option>
                  <option value="student">Student</option>
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading logs...</div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No impersonation logs found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Admin
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Target User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Started At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ended At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm">{log.adminName}</div>
                            <div className="text-xs text-gray-500">ID: {log.adminId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-sm">{log.targetUserName}</div>
                          <div className="text-xs text-gray-500">ID: {log.targetUserId}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(
                            log.targetUserRole
                          )}`}
                        >
                          {log.targetUserRole}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.endedAt ? new Date(log.endedAt).toLocaleString() : "In Progress"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-gray-400" />
                          {formatDuration(log.durationSeconds)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {log.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary Stats */}
          {logs && logs.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-900">Total Events</div>
                <div className="text-2xl font-bold text-blue-600 mt-1">{logs.length}</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-900">Completed</div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {logs.filter((l) => l.endedAt).length}
                </div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="text-sm font-medium text-orange-900">In Progress</div>
                <div className="text-2xl font-bold text-orange-600 mt-1">
                  {logs.filter((l) => !l.endedAt).length}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
