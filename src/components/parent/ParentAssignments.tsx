import { trpc } from "@/lib/trpc";
import { Loader2, Download, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ParentAssignmentsProps {
  studentId: number;
  studentName: string;
}

export function ParentAssignments({ studentId, studentName }: ParentAssignmentsProps) {
  const { data: assignments, isLoading } = trpc.parent.getChildAssignments.useQuery({ studentId });
  const { data: questions } = trpc.parent.getChildQuestions.useQuery({ studentId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-blue-700" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "upcoming":
        return <Badge className="bg-gray-400">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-blue-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{studentName}'s Assignment Progress</h1>
          <p className="text-gray-600 mt-1">Track all assignments and scores</p>
        </div>
        <Button className="bg-blue-700 hover:bg-blue-800">
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Assignment List */}
      <Card>
        <CardHeader>
          <CardTitle>All Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments && assignments.length > 0 ? (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                    </div>
                    <p className="text-sm text-gray-600">{assignment.description}</p>
                    
                    {assignment.status === "completed" && (
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Easy: <span className={getScoreColor(assignment.easyScore)}>{assignment.easyScore}/10</span>
                        </span>
                        <span className="text-gray-600">
                          Medium: <span className={getScoreColor(assignment.mediumScore)}>{assignment.mediumScore}/10</span>
                        </span>
                        <span className="text-gray-600">
                          Challenging: <span className={getScoreColor(assignment.challengingScore)}>{assignment.challengingScore}/10</span>
                        </span>
                      </div>
                    )}
                    
                    {assignment.completedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed: {format(new Date(assignment.completedAt), "PPP")}
                      </p>
                    )}
                  </div>

                  {assignment.status === "completed" && (
                    <div className="text-right ml-4">
                      <div className={`text-3xl font-bold ${assignment.overallScore >= 8 ? 'text-green-600' : assignment.overallScore >= 6 ? 'text-blue-600' : 'text-gray-600'}`}>
                        {assignment.overallScore}/10
                      </div>
                      <p className="text-xs text-gray-500">Overall</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No assignments yet</p>
          )}
        </CardContent>
      </Card>

      {/* Question Creation Examples */}
      {questions && questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{studentName}'s Question Creation Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.slice(0, 3).map((question) => (
                <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{question.subject}</h4>
                    <Badge variant={question.status === "answered" ? "default" : "secondary"}>
                      {question.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{question.questionText}</p>
                  {question.responseText && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-semibold text-gray-600 mb-1">Teacher Response:</p>
                      <p className="text-sm text-gray-700">{question.responseText}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {format(new Date(question.createdAt), "PPP")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
