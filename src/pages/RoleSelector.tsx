import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function RoleSelector() {
  const [, setLocation] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const updateRole = trpc.auth.updateRole.useMutation({
    onSuccess: (data) => {
      toast.success(`Role updated to ${data.role}`);
      // Redirect based on role
      switch (data.role) {
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
      }
    },
    onError: (error) => {
      toast.error(`Failed to update role: ${error.message}`);
    },
  });

  const roles = [
    {
      value: "student" as const,
      name: "Student",
      description: "Access your lessons and track your progress",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      value: "parent" as const,
      name: "Parent",
      description: "Monitor your child's learning journey",
      icon: Users,
      color: "bg-green-500",
    },
    {
      value: "teacher" as const,
      name: "Teacher",
      description: "Manage students and resources",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      value: "admin" as const,
      name: "Admin",
      description: "System administration and analytics",
      icon: Shield,
      color: "bg-red-500",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user.name}!</h1>
          <p className="text-lg text-gray-600">Please select your role to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.value} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-full ${role.color} flex items-center justify-center mb-3`}>
                  <role.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle>{role.name}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => updateRole.mutate({ role: role.value })}
                  disabled={updateRole.isPending}
                >
                  {updateRole.isPending ? "Updating..." : `Continue as ${role.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
