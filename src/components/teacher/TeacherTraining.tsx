import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, FileText, Shield, CheckCircle, BookOpen } from "lucide-react";

export default function TeacherTraining() {
  const trainingModules = [
    {
      id: 1,
      title: "5QHackMath Methodology",
      description: "Learn the core principles of the 5QHackMath teaching approach and how to apply it effectively with students.",
      icon: GraduationCap,
      status: "required",
      duration: "30 min",
    },
    {
      id: 2,
      title: "Student Privacy and Confidentiality",
      description: "Understanding your responsibilities regarding student data protection and confidentiality in online teaching.",
      icon: Shield,
      status: "required",
      duration: "20 min",
    },
    {
      id: 3,
      title: "Basic Rules for Teachers",
      description: "Essential guidelines and policies that all SCHROOL teachers must follow to maintain quality standards.",
      icon: FileText,
      status: "required",
      duration: "15 min",
    },
    {
      id: 4,
      title: "Terms and Conditions of Employment",
      description: "Review your employment terms, remuneration structure, and contractual obligations.",
      icon: BookOpen,
      status: "required",
      duration: "25 min",
    },
  ];

  const guidelines = [
    {
      title: "Response Time",
      description: "Respond to student questions within 12 hours",
      icon: "⏰",
    },
    {
      title: "Assignment Grading",
      description: "Grade all assignments within 48 hours of submission",
      icon: "📝",
    },
    {
      title: "Session Preparation",
      description: "Review student progress before each Zoom session",
      icon: "📊",
    },
    {
      title: "Professional Conduct",
      description: "Maintain professional communication with students and parents",
      icon: "🤝",
    },
    {
      title: "Attendance",
      description: "Conduct 2 Zoom sessions per week per Elite student",
      icon: "📅",
    },
    {
      title: "Feedback Quality",
      description: "Provide detailed, constructive feedback on all assignments",
      icon: "💬",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Teacher Training & Guidelines</h3>
        <p className="text-gray-600 mt-1">Complete required training modules and review teaching guidelines</p>
      </div>

      {/* Required Training Modules */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Required Training Modules</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trainingModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{module.duration}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      Required
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600">{module.description}</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Start Module
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Teaching Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Teaching Guidelines & Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guidelines.map((guideline, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-2xl mb-2">{guideline.icon}</div>
                <h5 className="font-semibold text-gray-900 mb-1">{guideline.title}</h5>
                <p className="text-sm text-gray-600">{guideline.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Elite Students:</strong> 2 Zoom sessions per week (48 total sessions)</p>
          <p>• <strong>Session Duration:</strong> 60 minutes per session</p>
          <p>• <strong>Assignment Turnaround:</strong> 48 hours maximum</p>
          <p>• <strong>Question Response:</strong> Within 12 hours</p>
          <p>• <strong>Professionalism:</strong> Always maintain professional communication</p>
          <p>• <strong>Privacy:</strong> Never share student information with unauthorized parties</p>
        </CardContent>
      </Card>
    </div>
  );
}
