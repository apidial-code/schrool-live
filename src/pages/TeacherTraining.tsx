import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Clock, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";

const COURSE_MODULES = [
  {
    id: 1,
    title: "Ensuring Student Privacy and Confidentiality in Online Teaching",
    description: "Learn best practices for protecting student data and maintaining confidentiality in virtual classrooms.",
    duration: "45 minutes",
    completed: false,
    questions: 15,
  },
  {
    id: 2,
    title: "Bloom's Taxonomy: Learning Objectives Framework",
    description: "Understand how to design lessons using Bloom's Taxonomy to create effective learning outcomes.",
    duration: "60 minutes",
    completed: false,
    questions: 15,
  },
  {
    id: 3,
    title: "Teachers Contacting Parents: Communication Rules",
    description: "Master professional communication protocols when interacting with parents and guardians.",
    duration: "30 minutes",
    completed: false,
    questions: 15,
  },
];

// Mock exam questions - in production, import from server data
const EXAM_QUESTIONS = [
  // Privacy & Confidentiality (15 questions)
  {
    id: 1,
    module: "privacy",
    question: "What does FERPA stand for?",
    options: [
      "Family Educational Rights and Privacy Act",
      "Federal Education Records and Privacy Authority",
      "Family Education Records and Personal Access",
      "Federal Educational Rights and Privacy Administration",
    ],
    correct: "Family Educational Rights and Privacy Act",
  },
  {
    id: 2,
    module: "privacy",
    question: "According to FERPA, who has the right to access a student's educational records?",
    options: [
      "Only school administrators",
      "Parents of minor students and eligible students over 18",
      "Any teacher in the school",
      "The student's peers and classmates",
    ],
    correct: "Parents of minor students and eligible students over 18",
  },
  {
    id: 3,
    module: "privacy",
    question: "What is the primary purpose of maintaining student confidentiality in online teaching?",
    options: [
      "To make the teacher's job easier",
      "To protect student data and build trust with families",
      "To comply with school policies only",
      "To prevent students from accessing their own records",
    ],
    correct: "To protect student data and build trust with families",
  },
  {
    id: 4,
    module: "privacy",
    question: "Which of the following is NOT an appropriate method for sharing student grades?",
    options: [
      "Secure Learning Management System (LMS)",
      "Direct email to parents",
      "Password-protected student portal",
      "Encrypted communication channel",
    ],
    correct: "Direct email to parents",
  },
  {
    id: 5,
    module: "privacy",
    question: "What should you do before recording an online lesson?",
    options: [
      "Record immediately without notice",
      "Obtain explicit written consent from parents and students",
      "Inform students only verbally",
      "Ask the school administrator's permission only",
    ],
    correct: "Obtain explicit written consent from parents and students",
  },
  {
    id: 6,
    module: "privacy",
    question: "Where should sensitive student discussions take place in a virtual classroom?",
    options: [
      "In the main session with all students present",
      "In public chat where everyone can see",
      "In one-on-one breakout rooms or private messages",
      "On social media platforms",
    ],
    correct: "In one-on-one breakout rooms or private messages",
  },
  {
    id: 7,
    module: "privacy",
    question: "What is the best practice for storing digital student records?",
    options: [
      "On personal computers without encryption",
      "In encrypted and password-protected databases",
      "On shared USB drives",
      "In public cloud storage without restrictions",
    ],
    correct: "In encrypted and password-protected databases",
  },
  {
    id: 8,
    module: "privacy",
    question: "Can you discuss a student's grades in a public group chat?",
    options: [
      "Yes, if the student is present",
      "Yes, if you use general terms",
      "No, this violates student privacy",
      "Yes, as long as you don't mention the student's name",
    ],
    correct: "No, this violates student privacy",
  },
  {
    id: 9,
    module: "privacy",
    question: "What should you do if a parent requests access to their child's educational records?",
    options: [
      "Deny the request",
      "Provide records in a timely manner and guide them through the process",
      "Tell them to contact the school later",
      "Share the records via email without verification",
    ],
    correct: "Provide records in a timely manner and guide them through the process",
  },
  {
    id: 10,
    module: "privacy",
    question: "What is two-factor authentication (2FA)?",
    options: [
      "Using two passwords for the same account",
      "An extra layer of security requiring two forms of verification",
      "Changing your password twice per month",
      "Sharing your password with two people",
    ],
    correct: "An extra layer of security requiring two forms of verification",
  },
  {
    id: 11,
    module: "privacy",
    question: "Can you share a student's educational record with an external tutor without consent?",
    options: [
      "Yes, if the tutor is helping the student",
      "Yes, if the school approves",
      "No, written parental consent is required",
      "Yes, if you keep a copy for yourself",
    ],
    correct: "No, written parental consent is required",
  },
  {
    id: 12,
    module: "privacy",
    question: "What should you do if you discover a privacy breach involving student data?",
    options: [
      "Keep it quiet to avoid trouble",
      "Report it immediately to the relevant administrative body",
      "Tell only your colleagues",
      "Wait to see if anyone notices",
    ],
    correct: "Report it immediately to the relevant administrative body",
  },
  {
    id: 13,
    module: "privacy",
    question: "Which of the following is a legitimate reason to disclose student information without consent?",
    options: [
      "To share with other teachers in the break room",
      "To post on social media",
      "Health or safety emergencies",
      "To help with marketing the school",
    ],
    correct: "Health or safety emergencies",
  },
  {
    id: 14,
    module: "privacy",
    question: "What should parents be able to do if they find inaccurate information in their child's records?",
    options: [
      "Nothing, records cannot be changed",
      "Request corrections through a clear process",
      "Change the records themselves",
      "Contact the school board only",
    ],
    correct: "Request corrections through a clear process",
  },
  {
    id: 15,
    module: "privacy",
    question: "What is the most secure way to communicate about sensitive student matters?",
    options: [
      "Text messages",
      "Public messaging platforms",
      "Secure, official communication channels with encryption",
      "Phone calls without documentation",
    ],
    correct: "Secure, official communication channels with encryption",
  },

  // Bloom's Taxonomy (15 questions)
  {
    id: 16,
    module: "blooms",
    question: "Who developed Bloom's Taxonomy?",
    options: [
      "John Dewey",
      "Benjamin Bloom and his committee",
      "Maria Montessori",
      "Paulo Freire",
    ],
    correct: "Benjamin Bloom and his committee",
  },
  {
    id: 17,
    module: "blooms",
    question: "What is the primary purpose of Bloom's Taxonomy?",
    options: [
      "To rank students by ability",
      "To classify learning objectives by cognitive complexity",
      "To measure teacher effectiveness",
      "To replace traditional grading systems",
    ],
    correct: "To classify learning objectives by cognitive complexity",
  },
  {
    id: 18,
    module: "blooms",
    question: "What are the six levels of Bloom's Taxonomy (revised 2001)?",
    options: [
      "Know, Understand, Apply, Analyze, Synthesize, Evaluate",
      "Remember, Understand, Apply, Analyze, Evaluate, Create",
      "Learn, Comprehend, Use, Break Down, Judge, Invent",
      "Identify, Explain, Demonstrate, Compare, Assess, Produce",
    ],
    correct: "Remember, Understand, Apply, Analyze, Evaluate, Create",
  },
  {
    id: 19,
    module: "blooms",
    question: "Which level of Bloom's Taxonomy represents the highest order of thinking?",
    options: [
      "Remember",
      "Understand",
      "Analyze",
      "Create",
    ],
    correct: "Create",
  },
  {
    id: 20,
    module: "blooms",
    question: "What is an example of a 'Remember' level learning objective?",
    options: [
      "Design a new marketing campaign",
      "List the capitals of all countries",
      "Explain why photosynthesis is important",
      "Compare two different teaching methods",
    ],
    correct: "List the capitals of all countries",
  },
  {
    id: 21,
    module: "blooms",
    question: "Which verb is most appropriate for an 'Analyze' level objective?",
    options: [
      "List",
      "Explain",
      "Compare",
      "Create",
    ],
    correct: "Compare",
  },
  {
    id: 22,
    module: "blooms",
    question: "What does 'Apply' level learning involve?",
    options: [
      "Memorizing facts",
      "Using knowledge in new situations",
      "Judging the value of information",
      "Creating original works",
    ],
    correct: "Using knowledge in new situations",
  },
  {
    id: 23,
    module: "blooms",
    question: "Which learning level requires students to make judgments based on criteria?",
    options: [
      "Remember",
      "Understand",
      "Evaluate",
      "Create",
    ],
    correct: "Evaluate",
  },
  {
    id: 24,
    module: "blooms",
    question: "What is the relationship between Bloom's Taxonomy and lesson planning?",
    options: [
      "They are unrelated",
      "Bloom's helps align objectives, activities, and assessments",
      "Bloom's is only for assessment",
      "Bloom's replaces lesson planning",
    ],
    correct: "Bloom's helps align objectives, activities, and assessments",
  },
  {
    id: 25,
    module: "blooms",
    question: "When designing differentiated instruction, what should you do?",
    options: [
      "Keep all students at the Remember level",
      "Move students beyond lower levels toward analysis, evaluation, and creation",
      "Only use the Create level",
      "Avoid using Bloom's Taxonomy",
    ],
    correct: "Move students beyond lower levels toward analysis, evaluation, and creation",
  },
  {
    id: 26,
    module: "blooms",
    question: "Which of the following is a 'Create' level objective?",
    options: [
      "Define the term 'ecosystem'",
      "Explain the water cycle",
      "Design a sustainable city plan",
      "Identify different types of clouds",
    ],
    correct: "Design a sustainable city plan",
  },
  {
    id: 27,
    module: "blooms",
    question: "What is the 'knowledge dimension' in the revised Bloom's Taxonomy?",
    options: [
      "The difficulty of the content",
      "The type of knowledge being learned (factual, conceptual, procedural, metacognitive)",
      "The number of students in the class",
      "The time spent on a lesson",
    ],
    correct: "The type of knowledge being learned (factual, conceptual, procedural, metacognitive)",
  },
  {
    id: 28,
    module: "blooms",
    question: "How should assessment align with learning objectives?",
    options: [
      "Assessment should be unrelated to objectives",
      "Assessment should measure the same cognitive level as the objectives",
      "Assessment should always be at the Remember level",
      "Assessment is not important if objectives are clear",
    ],
    correct: "Assessment should measure the same cognitive level as the objectives",
  },
  {
    id: 29,
    module: "blooms",
    question: "What verb would you use for an 'Understand' level objective?",
    options: [
      "Create",
      "Summarize",
      "Evaluate",
      "Construct",
    ],
    correct: "Summarize",
  },
  {
    id: 30,
    module: "blooms",
    question: "Why is it important to include higher-order thinking levels in your lessons?",
    options: [
      "It makes lessons more difficult",
      "It develops critical thinking and problem-solving skills",
      "It reduces the need for assessment",
      "It eliminates the need for lower-level thinking",
    ],
    correct: "It develops critical thinking and problem-solving skills",
  },

  // Teacher-Parent Communication (15 questions)
  {
    id: 31,
    module: "communication",
    question: "What is the most appropriate channel for contacting parents about student progress?",
    options: [
      "Personal social media accounts",
      "The platform's official messaging tools",
      "Personal phone calls",
      "Text messages",
    ],
    correct: "The platform's official messaging tools",
  },
  {
    id: 32,
    module: "communication",
    question: "How should you notify parents of schedule changes?",
    options: [
      "Wait until the change happens",
      "Notify them promptly through official channels",
      "Tell the student to inform their parents",
      "Post on social media",
    ],
    correct: "Notify them promptly through official channels",
  },
  {
    id: 33,
    module: "communication",
    question: "What should you avoid discussing with parents?",
    options: [
      "Student academic progress",
      "Attendance issues",
      "Unrelated matters or personal opinions",
      "Concerns about student behavior",
    ],
    correct: "Unrelated matters or personal opinions",
  },
  {
    id: 34,
    module: "communication",
    question: "How should you handle a difficult conversation with a parent?",
    options: [
      "Avoid the conversation",
      "Be defensive and argumentative",
      "Remain professional, listen actively, and focus on the student's benefit",
      "Involve other students in the discussion",
    ],
    correct: "Remain professional, listen actively, and focus on the student's benefit",
  },
  {
    id: 35,
    module: "communication",
    question: "What is the purpose of regular communication with parents?",
    options: [
      "To complain about the student",
      "To build trust and keep parents informed of progress",
      "To avoid accountability",
      "To make the teacher's job easier",
    ],
    correct: "To build trust and keep parents informed of progress",
  },
  {
    id: 36,
    module: "communication",
    question: "How should you document parent communications?",
    options: [
      "Keep no record",
      "Write informal notes on paper",
      "Keep records in the official platform for accountability",
      "Tell the parent what you discussed later",
    ],
    correct: "Keep records in the official platform for accountability",
  },
  {
    id: 37,
    module: "communication",
    question: "What should you do if a parent requests to communicate outside the platform?",
    options: [
      "Agree to use personal email or phone",
      "Politely redirect them to use the official platform",
      "Ignore the request",
      "Agree but don't document it",
    ],
    correct: "Politely redirect them to use the official platform",
  },
  {
    id: 38,
    module: "communication",
    question: "How should you communicate about a student's behavioral issues?",
    options: [
      "Share it publicly in group chats",
      "Use private, professional communication with parents",
      "Tell other teachers first",
      "Avoid mentioning it",
    ],
    correct: "Use private, professional communication with parents",
  },
  {
    id: 39,
    module: "communication",
    question: "What is the best frequency for parent communication?",
    options: [
      "Never, unless there's a problem",
      "Only at report card time",
      "Regular updates, both positive and constructive",
      "Only when the student fails",
    ],
    correct: "Regular updates, both positive and constructive",
  },
  {
    id: 40,
    module: "communication",
    question: "How should you respond to a parent complaint?",
    options: [
      "Become defensive",
      "Listen, acknowledge, and work toward a solution",
      "Ignore it",
      "Complain to other teachers",
    ],
    correct: "Listen, acknowledge, and work toward a solution",
  },
  {
    id: 41,
    module: "communication",
    question: "What information should you include in progress reports to parents?",
    options: [
      "Only negative feedback",
      "Academic progress, strengths, and areas for improvement",
      "Personal opinions about the student",
      "Comparisons to other students",
    ],
    correct: "Academic progress, strengths, and areas for improvement",
  },
  {
    id: 42,
    module: "communication",
    question: "How should you handle a parent who disagrees with your assessment?",
    options: [
      "Refuse to discuss it",
      "Listen to their perspective and explain your assessment professionally",
      "Change the grade to make them happy",
      "Involve the student in the argument",
    ],
    correct: "Listen to their perspective and explain your assessment professionally",
  },
  {
    id: 43,
    module: "communication",
    question: "What tone should you use when communicating with parents?",
    options: [
      "Condescending",
      "Casual and informal",
      "Professional, respectful, and collaborative",
      "Angry or frustrated",
    ],
    correct: "Professional, respectful, and collaborative",
  },
  {
    id: 44,
    module: "communication",
    question: "How should you handle a parent who contacts you at inappropriate times?",
    options: [
      "Answer immediately no matter what",
      "Ignore all messages",
      "Set clear boundaries and respond during appropriate hours",
      "Block their contact",
    ],
    correct: "Set clear boundaries and respond during appropriate hours",
  },
  {
    id: 45,
    module: "communication",
    question: "What is the key to effective teacher-parent partnerships?",
    options: [
      "Teachers always being right",
      "Parents always being right",
      "Mutual respect, open communication, and shared focus on student success",
      "Minimal interaction",
    ],
    correct: "Mutual respect, open communication, and shared focus on student success",
  },
];

export function TeacherTraining() {
  const { code } = useParams<{ code: string }>();
  const [, setLocation] = useLocation();
  const [stage, setStage] = useState<"warning" | "training" | "exam" | "results">("warning");
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, string>>({});
  const [examScore, setExamScore] = useState<number | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);
  const [currentAttempt, setCurrentAttempt] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Validate approval code
  const { data: codeValidation, isLoading: isValidating } = trpc.teacherOnboarding.validateApprovalCode.useQuery(
    { approvalCode: code || "" },
    { enabled: !!code }
  );

  // Get exam attempts
  const { data: attempts } = trpc.teacherOnboarding.getExamAttempts.useQuery(
    { email: codeValidation?.email || "" },
    { enabled: !!codeValidation?.email }
  );

  useEffect(() => {
    if (attempts) {
      setCurrentAttempt(attempts.totalAttempts + 1);
      setAttemptsRemaining(attempts.attemptsRemaining ?? 5);
    }
  }, [attempts]);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating your approval code...</p>
        </div>
      </div>
    );
  }

  if (!codeValidation?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Approval Code</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              The approval code you provided is invalid or has expired. Please check your email for the correct code.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stage 1: Critical Warning
  if (stage === "warning") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              IMPORTANT: Certification Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Information</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>You have UP TO 5 ATTEMPTS to pass the certification exam</li>
                  <li>You must achieve 80% or higher to pass (36 out of 45 questions)</li>
                  <li>After 5 failed attempts, your application will be PERMANENTLY REJECTED</li>
                  <li>Please study the course materials carefully before attempting the exam</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Course Overview:</h3>
              <div className="space-y-2">
                {COURSE_MODULES.map((module) => (
                  <div key={module.id} className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{module.title}</p>
                      <p className="text-xs text-muted-foreground">{module.questions} exam questions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>Total Exam:</strong> 45 questions covering all three modules
              </p>
              <p className="text-sm text-blue-900">
                <strong>Passing Score:</strong> 80% (36 correct answers)
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={warningAcknowledged}
                  onChange={(e) => setWarningAcknowledged(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  I understand the requirements and am ready to proceed
                </span>
              </label>
            </div>

            <Button
              onClick={() => setStage("training")}
              disabled={!warningAcknowledged}
              className="w-full"
              size="lg"
            >
              Start Training Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Stage 2: Training Modules
  if (stage === "training") {
    const allCompleted = completedModules.length === COURSE_MODULES.length;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Teacher Certification Training</h1>
            <p className="text-muted-foreground">
              Complete all course modules before taking the certification exam
            </p>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedModules.length} of {COURSE_MODULES.length} completed
              </span>
            </div>
            <Progress value={(completedModules.length / COURSE_MODULES.length) * 100} />
          </div>

          <div className="space-y-4">
            {COURSE_MODULES.map((module) => {
              const isCompleted = completedModules.includes(module.id);
              return (
                <Card key={module.id} className={isCompleted ? "border-green-500 bg-green-50" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {module.title}
                        </CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                      <div className="flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {module.duration}
                        </div>
                        <div className="text-xs bg-muted px-2 py-1 rounded">
                          {module.questions} questions
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" />
                        Module Completed
                      </div>
                    ) : (
                      <Button
                        onClick={() => setCompletedModules([...completedModules, module.id])}
                        variant="outline"
                      >
                        Mark as Completed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button
            onClick={() => {
              setCurrentQuestionIndex(0);
              setStage("exam");
            }}
            disabled={!allCompleted}
            className="w-full mt-6"
            size="lg"
          >
            Proceed to Certification Exam <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Stage 3: Certification Exam
  if (stage === "exam") {
    const currentQuestion = EXAM_QUESTIONS[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === EXAM_QUESTIONS.length - 1;
    const allAnswered = Object.keys(examAnswers).length === EXAM_QUESTIONS.length;

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Certification Exam</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {EXAM_QUESTIONS.length}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Attempt {currentAttempt} of 5</p>
                <p className="text-sm font-medium text-destructive">
                  {attemptsRemaining} attempts remaining
                </p>
              </div>
            </div>
            <Progress value={((currentQuestionIndex + 1) / EXAM_QUESTIONS.length) * 100} />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              <CardDescription>
                Select the correct answer from the options below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentQuestion.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                  >
                    <input
                      type="radio"
                      name={`q${currentQuestion.id}`}
                      value={option}
                      checked={examAnswers[currentQuestion.id] === option}
                      onChange={(e) =>
                        setExamAnswers({ ...examAnswers, [currentQuestion.id]: e.target.value })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={() => {
                  // Calculate score
                  let correct = 0;
                  EXAM_QUESTIONS.forEach((q) => {
                    if (examAnswers[q.id] === q.correct) correct++;
                  });
                  const score = (correct / EXAM_QUESTIONS.length) * 100;
                  setExamScore(score);
                  setStage("results");
                }}
                disabled={!allAnswered}
                className="flex-1"
              >
                Submit Exam
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!examAnswers[currentQuestion.id]}
                className="flex-1"
              >
                Next
              </Button>
            )}
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Progress: {Object.keys(examAnswers).length} of {EXAM_QUESTIONS.length} questions answered
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stage 4: Results
  if (stage === "results" && examScore !== null) {
    const passed = examScore >= 80;
    let correct = 0;
    EXAM_QUESTIONS.forEach((q) => {
      if (examAnswers[q.id] === q.correct) correct++;
    });

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${passed ? "text-green-600" : "text-destructive"}`}>
              {passed ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
              {passed ? "Exam Passed!" : "Exam Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-4xl font-bold mb-2">{Math.round(examScore)}%</p>
              <p className="text-muted-foreground text-sm">
                {correct} out of {EXAM_QUESTIONS.length} questions correct
              </p>
            </div>

            <Alert className={passed ? "border-green-500 bg-green-50" : "border-destructive bg-destructive/10"}>
              <AlertCircle className={`h-4 w-4 ${passed ? "text-green-600" : "text-destructive"}`} />
              <AlertTitle>{passed ? "Congratulations!" : "Next Steps"}</AlertTitle>
              <AlertDescription>
                {passed
                  ? "You have passed the certification exam. You will receive the teacher agreement form via email shortly."
                  : `You scored ${Math.round(examScore)}%. You need 80% to pass. You have ${attemptsRemaining - 1} attempts remaining.`}
              </AlertDescription>
            </Alert>

            {passed ? (
              <Button onClick={() => setLocation("/")} className="w-full">
                Return to Home
              </Button>
            ) : attemptsRemaining > 1 ? (
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setExamAnswers({});
                    setExamScore(null);
                    setCurrentQuestionIndex(0);
                    setStage("exam");
                    setCurrentAttempt(currentAttempt + 1);
                    setAttemptsRemaining(attemptsRemaining - 1);
                  }}
                  className="w-full"
                >
                  Retake Exam
                </Button>
                <Button onClick={() => setLocation("/")} variant="outline" className="w-full">
                  Return to Home
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Application Rejected</AlertTitle>
                  <AlertDescription>
                    You have exceeded the maximum number of attempts. Your application has been permanently rejected.
                  </AlertDescription>
                </Alert>
                <Button onClick={() => setLocation("/")} className="w-full">
                  Return to Home
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
