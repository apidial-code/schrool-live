import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Shield } from "lucide-react";

export default function DemoLanding() {
  const roles = [
    {
      value: "student",
      name: "Student Dashboard",
      description: "View lessons, track progress, and submit questions",
      icon: GraduationCap,
      color: "bg-blue-500",
      path: "/student",
    },
    {
      value: "parent",
      name: "Parent Dashboard",
      description: "Monitor your child's learning journey and achievements",
      icon: Users,
      color: "bg-green-500",
      path: "/parent",
    },
    {
      value: "teacher",
      name: "Teacher Dashboard",
      description: "Manage students, assignments, and resources",
      icon: BookOpen,
      color: "bg-purple-500",
      path: "/teacher",
    },
    {
      value: "admin",
      name: "Admin Dashboard",
      description: "Full system administration and analytics control",
      icon: Shield,
      color: "bg-red-500",
      path: "/admin",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">SCHROOL Learning Platform</h1>
          <p className="text-xl text-gray-700 mb-2">Year 5-9 Mathematics Excellence</p>
          <div className="inline-block bg-orange-100 border-2 border-orange-500 rounded-lg px-6 py-3 mt-4">
            <p className="text-lg text-orange-700 font-bold">🎯 DEMO MODE - Board Presentation</p>
            <p className="text-sm text-orange-600 mt-1">No authentication required • Full access to all dashboards</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.value} className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400">
                <CardHeader>
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center text-lg">{role.name}</CardTitle>
                  <CardDescription className="text-center">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <a href={role.path}>
                    <Button
                      className="w-full text-base py-6"
                      size="lg"
                    >
                      Open {role.name}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">📋 Presentation Flow</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Admin Dashboard First</strong> - Show complete control (board members are "control freaks")</li>
            <li><strong>Student Dashboard</strong> - Demonstrate the learning experience with video lessons</li>
            <li><strong>Parent Dashboard</strong> - Show progress tracking and communication features</li>
            <li><strong>Teacher Dashboard</strong> - Display resource management and student oversight</li>
          </ol>
        </div>

        <div className="text-center text-sm text-gray-500 bg-white rounded-lg p-4 shadow-sm">
          <p className="mb-2">This demo mode allows direct access to all platform features without authentication.</p>
          <p className="text-xs text-gray-400">For production, full OAuth authentication and role-based access control is implemented.</p>
        </div>
      </div>
    </div>
  );
}
