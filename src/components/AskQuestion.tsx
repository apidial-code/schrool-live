import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, MessageSquare, CheckCircle2, Clock, Archive } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function AskQuestion() {
  const [subject, setSubject] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [lessonId, setLessonId] = useState<number | undefined>(undefined);

  const utils = trpc.useUtils();

  const { data: questions, isLoading: questionsLoading } = trpc.questions.myQuestions.useQuery();
  const { data: stats } = trpc.questions.stats.useQuery();
  const { data: lessons } = trpc.lessons.list.useQuery();

  const submitMutation = trpc.questions.submit.useMutation({
    onSuccess: () => {
      toast.success("Question submitted successfully!");
      setSubject("");
      setQuestionText("");
      setLessonId(undefined);
      utils.questions.myQuestions.invalidate();
      utils.questions.stats.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to submit question: ${error.message}`);
    },
  });

  const archiveMutation = trpc.questions.archive.useMutation({
    onSuccess: () => {
      toast.success("Question archived");
      utils.questions.myQuestions.invalidate();
      utils.questions.stats.invalidate();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }
    
    if (!questionText.trim() || questionText.trim().length < 10) {
      toast.error("Please enter a question (at least 10 characters)");
      return;
    }

    submitMutation.mutate({
      subject: subject.trim(),
      questionText: questionText.trim(),
      lessonId,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "answered":
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle2 className="w-3 h-3 mr-1" />Answered</Badge>;
      case "archived":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800"><Archive className="w-3 h-3 mr-1" />Archived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Ask a Question</h2>
          <p className="text-gray-600 mt-1">Get help from your teachers</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{stats.answered}</p>
                <p className="text-sm text-gray-600 mt-1">Answered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{stats.archived}</p>
                <p className="text-sm text-gray-600 mt-1">Archived</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Submit Question Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Submit a New Question
          </CardTitle>
          <CardDescription>
            Ask your teacher any questions about the lessons or exercises
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson">Related Lesson (Optional)</Label>
              <select
                id="lesson"
                value={lessonId || ""}
                onChange={(e) => setLessonId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a lesson (optional) --</option>
                {lessons?.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your question"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={255}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="question">Your Question *</Label>
              <Textarea
                id="question"
                placeholder="Describe your question in detail (minimum 10 characters)"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={6}
                required
                minLength={10}
              />
              <p className="text-sm text-gray-500">
                {questionText.length} characters (minimum 10 required)
              </p>
            </div>

            <Button
              type="submit"
              disabled={submitMutation.isPending || !subject.trim() || questionText.trim().length < 10}
              className="w-full"
            >
              {submitMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Question
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Questions History */}
      <Card>
        <CardHeader>
          <CardTitle>Your Questions</CardTitle>
          <CardDescription>Track the status of your submitted questions</CardDescription>
        </CardHeader>
        <CardContent>
          {questionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : questions && questions.length > 0 ? (
            <div className="space-y-4">
              {questions.map((question) => (
                <div
                  key={question.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{question.subject}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(question.status)}
                      {question.status === "answered" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => archiveMutation.mutate({ id: question.id })}
                          disabled={archiveMutation.isPending}
                        >
                          <Archive className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3">{question.questionText}</p>
                  
                  {question.status === "answered" && question.responseText && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-3">
                      <p className="text-sm font-semibold text-green-900 mb-1">Teacher's Response:</p>
                      <p className="text-sm text-green-800">{question.responseText}</p>
                      {question.respondedAt && (
                        <p className="text-xs text-green-600 mt-2">
                          Answered {formatDistanceToNow(new Date(question.respondedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">You haven't asked any questions yet.</p>
              <p className="text-sm text-gray-500 mt-1">Submit your first question above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
