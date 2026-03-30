import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";

export default function Login() {
  const roles = [
    {
      name: "Student",
      description: "Access your lessons and track your progress",
      icon: GraduationCap,
      color: "bg-blue-500",
    },
    {
      name: "Parent",
      description: "Monitor your child's learning journey",
      icon: Users,
      color: "bg-green-500",
    },
    {
      name: "Teacher",
      description: "Manage students and resources",
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      name: "Admin",
      description: "System administration and analytics",
      icon: Shield,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SCHROOL Learning Platform</h1>
          <p className="text-lg text-gray-600">Year 7 Mathematics Excellence</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((role) => (
            <Card key={role.name} className="hover:shadow-lg transition-shadow">
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
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                >
                  Login as {role.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Secure authentication powered by GitHub</p>
        </div>
      </div>
    </div>
  );
}
