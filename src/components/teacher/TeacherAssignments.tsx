import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ClipboardList, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TeacherAssignments() {
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");

  const { data: assignments, isLoading } = trpc.teacher.getPendingAssignments.useQuery();
  const utils = trpc.useUtils();

  const gradeAssignment = trpc.teacher.gradeAssignment.useMutation({
    onSuccess: () => {
      toast.success("Assignment graded successfully!");
      utils.teacher.getPendingAssignments.invalidate();
      setSelectedAssignment(null);
      setGrade("");
      setFeedback("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to grade assignment");
    },
  });

  const handleGradeSubmit = () => {
    if (!selectedAssignment) return;
    if (!grade || isNaN(Number(grade)) || Number(grade) < 0 || Number(grade) > 100) {
      toast.error("Please enter a valid grade (0-100)");
      return;
    }

    gradeAssignment.mutate({
      assignmentId: selectedAssignment.id,
      grade: Number(grade),
      ...(feedback ? { feedback } : {}),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No pending assignments to grade at the moment.</p>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">Grade Assignment</h3>
          <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedAssignment.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
              <span>Student: {selectedAssignment.studentName}</span>
              <span>•</span>
              <span>Submitted: {format(new Date(selectedAssignment.submittedAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Student's Work:</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedAssignment.content}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grade (0-100) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Enter grade"
                className="max-w-xs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback (Optional)
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Provide feedback to help the student improve..."
                rows={6}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleGradeSubmit}
                disabled={gradeAssignment.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {gradeAssignment.isPending ? "Submitting..." : "Submit Grade"}
              </Button>
              <Button variant="outline" onClick={() => setSelectedAssignment(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Pending Assignments</h3>
          <p className="text-gray-600 mt-1">{assignments.length} assignment{assignments.length > 1 ? "s" : ""} awaiting your review</p>
        </div>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment: any) => (
          <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg text-gray-900 mb-1">{assignment.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <ClipboardList className="w-4 h-4" />
                      {assignment.studentName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Submitted {format(new Date(assignment.submittedAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  {assignment.daysWaiting > 1 && (
                    <div className="flex items-center gap-1 mt-2 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm">Waiting {assignment.daysWaiting} days</span>
                    </div>
                  )}
                </div>
                <Button onClick={() => setSelectedAssignment(assignment)}>
                  Grade Assignment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
