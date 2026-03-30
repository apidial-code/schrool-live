import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function DemoRoleSelector() {
  const [, setLocation] = useLocation();

  const roles = [
    {
      value: "student",
      name: "Student",
      description: "Access your lessons and track your progress",
      icon: GraduationCap,
      color: "bg-blue-500",
      path: "/student",
    },
    {
      value: "parent",
      name: "Parent",
      description: "Monitor your child's learning journey",
      icon: Users,
      color: "bg-green-500",
      path: "/parent",
    },
    {
      value: "teacher",
      name: "Teacher",
      description: "Manage students and resources",
      icon: BookOpen,
      color: "bg-purple-500",
      path: "/teacher",
    },
    {
      value: "admin",
      name: "Admin",
      description: "System administration and analytics",
      icon: Shield,
      color: "bg-red-500",
      path: "/admin",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SCHROOL Learning Platform</h1>
          <p className="text-lg text-gray-600">Year 7 Mathematics Excellence</p>
          <p className="text-sm text-orange-600 font-semibold mt-2">DEMO MODE - No Authentication Required</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.value} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => setLocation(role.path)}
                  >
                    Continue as {role.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Demo mode allows direct access to all dashboards without authentication</p>
        </div>
      </div>
    </div>
  );
}
