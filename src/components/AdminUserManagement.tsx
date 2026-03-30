import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Edit, Trash2, Plus, Eye, UserCog } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useLocation } from "wouter";

export default function AdminUserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"student" | "parent" | "teacher" | "admin" | undefined>();
  const { startImpersonation } = useImpersonation();
  const [, setLocation] = useLocation();

  const { data: users, isLoading, refetch } = trpc.admin.getAllUsers.useQuery({
    role: roleFilter,
    search: searchTerm,
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      await deleteUserMutation.mutateAsync({ userId });
    }
  };

  const handleViewAs = (user: any) => {
    startImpersonation(user.id, user.role, user.name || user.email);
    
    // Navigate to appropriate dashboard
    switch (user.role) {
      case "student":
        setLocation("/student");
        break;
      case "parent":
        setLocation("/parent");
        break;
      case "teacher":
        setLocation("/teacher");
        break;
      case "admin":
        setLocation("/admin");
        break;
      default:
        setLocation("/");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter || ""}
              onChange={(e) => setRoleFilter(e.target.value as any || undefined)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="parent">Parents</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No users found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user: any) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{user.name || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin" ? "bg-red-100 text-red-800" :
                          user.role === "teacher" ? "bg-purple-100 text-purple-800" :
                          user.role === "parent" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewAs(user)}
                            title="View as this user"
                          >
                            <UserCog className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
