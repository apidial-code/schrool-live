import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BunnyVideoPlayer } from "./BunnyVideoPlayer";
import { X, RotateCcw, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";

interface LessonViewerProps {
  lessonId: number;
  onClose: () => void;
}

type Difficulty = "easy" | "medium" | "challenging";

interface Exercise {
  id: number;
  lessonId: number;
  difficulty: string;
  question: string;
  correctAnswer: string;
  solutionVideoId: string | null;
  orderIndex: number;
  options: string | null;
  imageUrl: string | null;
}

// A displayed option: the text shown, its display label (A/B/C/D/E), and whether it is correct.
interface DisplayOption {
  label: string;       // "A", "B", "C", "D", "E"
  text: string;        // the answer text shown to the student
  isCorrect: boolean;  // tagged at build time from correctAnswer
}

/**
 * Renders text with proper school-style fractions.
 * Detects patterns like "1/2" or "2 3/4" and renders them vertically.
 */
function FractionRenderer({ text }: { text: string }) {
  if (!text) return null;

  // Regex to find fractions: 
  // 1. Optional whole number (group 1)
  // 2. Space (optional)
  // 3. Numerator (group 2)
  // 4. Slash
  // 5. Denominator (group 3)
  // Example matches: "1/2", "2 3/4", "10/16"
  const fractionRegex = /(\d+)?\s*(\d+)\/(\d+)/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = fractionRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const wholeNumber = match[1];
    const numerator = match[2];
    const denominator = match[3];

    parts.push(
      <span key={match.index} className="inline-flex items-center align-middle mx-0.5">
        {wholeNumber && <span className="mr-1">{wholeNumber}</span>}
        <span className="inline-flex flex-col items-center text-[0.85em] leading-none">
          <span className="pb-0.5 border-b border-current min-w-[1.2em] text-center">{numerator}</span>
          <span className="pt-0.5 min-w-[1.2em] text-center">{denominator}</span>
        </span>
      </span>
    );

    lastIndex = fractionRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return <span className="inline-block">{parts.length > 0 ? parts : text}</span>;
}

// What we store per question once the student selects an answer.
interface QuestionAnswer {
  selectedLabel: string;   // "A"–"E" — purely for display (highlighting selected option)
  isCorrect: boolean;      // captured at click time — this is what scoring uses
  solutionWatched: boolean;
}

// ─── Seeded Fisher-Yates shuffle ─────────────────────────────────────────────
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = (seed >>> 0) || 1;
  for (let i = result.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Build the shuffled display options for one exercise.
// The isCorrect flag is set by comparing each option text to correctAnswer.
// This happens once per exercise per session — the result is stored in a ref.
function buildDisplayOptions(ex: Exercise, seed: number): DisplayOption[] {
  let rawOptions: string[] = [];
  try {
    if (ex.options) rawOptions = JSON.parse(ex.options);
  } catch { /* ignore */ }
  if (rawOptions.length === 0) {
    rawOptions = ["Option A", "Option B", "Option C", "Option D", "Option E"];
  }

  const correctTrimmed = (ex.correctAnswer ?? "").trim();

  // Tag before shuffling
  const tagged = rawOptions.map(text => ({
    text: text.trim(),
    isCorrect: text.trim() === correctTrimmed,
  }));

  // Shuffle with a seed unique to this exercise × session
  const shuffled = seededShuffle(tagged, seed ^ ex.id);

  // Assign display labels A–E after shuffling
  return shuffled.map((item, i) => ({
    label: String.fromCharCode(65 + i),
    text: item.text,
    isCorrect: item.isCorrect,
  }));
}

export function LessonViewer({ lessonId, onClose }: LessonViewerProps) {
  const [currentLevel, setCurrentLevel] = useState<Difficulty>("easy");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSolutionVideo, setShowSolutionVideo] = useState(false);
  const [levelResults, setLevelResults] = useState<{
    easy?: { score: number; total: number; passed: boolean };
    medium?: { score: number; total: number; passed: boolean };
    challenging?: { score: number; total: number; passed: boolean };
  }>({});

  const [lesson, setLesson] = useState<any>(null);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [lessonLoading, setLessonLoading] = useState(true);

  // ── Per-question answers — stored in a ref so updates never trigger re-renders
  // that could invalidate memos. We also keep a parallel state copy just for
  // forcing re-renders when we need the UI to update (e.g. highlight selection).
  const answersRef = useRef<Record<number, QuestionAnswer>>({});
  const [answersTick, setAnswersTick] = useState(0); // increment to force re-render

  // ── Shuffled options stored in a ref — built once per session, never re-built
  // unless the user explicitly restarts (which calls resetSession).
  const optionsRef = useRef<Record<number, DisplayOption[]>>({});
  const sessionSeedRef = useRef<number>((Math.random() * 0xffffffff) >>> 0);

  const { data: progress } = trpc.progress.getLessonProgress.useQuery({ lessonId });

  // ── Fetch lesson + exercises once ──────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLessonLoading(true);
        const [lRes, eRes] = await Promise.all([
          fetch(`/api/lessons/direct/${lessonId}`),
          fetch(`/api/lessons/direct/${lessonId}/exercises`),
        ]);
        if (cancelled) return;
        if (lRes.ok) setLesson(await lRes.json());
        if (eRes.ok) setAllExercises(await eRes.json());
      } catch (err) {
        console.error("[LessonViewer] fetch error:", err);
      } finally {
        if (!cancelled) setLessonLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [lessonId]);

  const updateProgress = trpc.progress.updateLessonProgress.useMutation({
    onSuccess: () => toast.success("Progress saved!"),
  });

  // ── Exercises for the current level (derived, not memoised — safe because
  //    allExercises and currentLevel are stable between renders in normal flow)
  const exercises = allExercises.filter(ex => ex.difficulty === currentLevel);
  const currentExercise = exercises[currentQuestionIndex] ?? null;

  // ── Build options for any exercise that doesn't have them yet ─────────────
  // Called lazily so we only build what we need.
  const getOptions = (ex: Exercise): DisplayOption[] => {
    if (!optionsRef.current[ex.id]) {
      optionsRef.current[ex.id] = buildDisplayOptions(ex, sessionSeedRef.current);
    }
    return optionsRef.current[ex.id];
  };

  // ── Reset everything for a fresh session ──────────────────────────────────
  const resetSession = (level?: Difficulty) => {
    sessionSeedRef.current = (Math.random() * 0xffffffff) >>> 0;
    optionsRef.current = {};   // clear cached options so they rebuild with new seed
    answersRef.current = {};   // clear all answers
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setShowSolutionVideo(false);
    setAnswersTick(t => t + 1);
    if (level) setCurrentLevel(level);
  };

  // ── Level unlock logic ─────────────────────────────────────────────────────
  const isLevelUnlocked = (level: Difficulty): boolean => {
    if (level === "easy") return true;
    if (level === "medium") return progress?.easyCompleted === 1 || !!levelResults.easy?.passed;
    if (level === "challenging") return progress?.mediumCompleted === 1 || !!levelResults.medium?.passed;
    return false;
  };

  // ── Handle student selecting an option ────────────────────────────────────
  // isCorrect is captured HERE at click time and stored immediately.
  // Scoring at submit time simply reads this stored flag — no lookup, no comparison.
  const handleOptionSelect = (opt: DisplayOption) => {
    if (!currentExercise) return;
    answersRef.current[currentExercise.id] = {
      selectedLabel: opt.label,
      isCorrect: opt.isCorrect,
      solutionWatched: answersRef.current[currentExercise.id]?.solutionWatched ?? false,
    };
    setAnswersTick(t => t + 1); // trigger re-render to show selection highlight
  };

  const handleWatchSolution = () => {
    if (!currentExercise) return;
    const prev = answersRef.current[currentExercise.id] ?? { selectedLabel: "", isCorrect: false, solutionWatched: false };
    answersRef.current[currentExercise.id] = { ...prev, solutionWatched: true };
    setShowSolutionVideo(true);
    setAnswersTick(t => t + 1);
    toast.warning("This question will not count toward your final score");
  };

  const handleNext = () => {
    if (currentQuestionIndex < exercises.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setShowSolutionVideo(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(i => i - 1);
      setShowSolutionVideo(false);
    }
  };

  // ── Submit — scoring reads the isCorrect flag stored at click time ─────────
  const handleSubmit = () => {
    let correctCount = 0;
    exercises.forEach(ex => {
      const ans = answersRef.current[ex.id];
      if (ans && !ans.solutionWatched && ans.isCorrect) correctCount++;
    });

    const passed = correctCount >= 8;
    setLevelResults(prev => ({ ...prev, [currentLevel]: { score: correctCount, total: exercises.length, passed } }));

    const updateData: any = {
      lessonId,
      difficulty: currentLevel,
      difficultyScore: correctCount,
      difficultyTotal: exercises.length,
      difficultyCompleted: passed ? 1 : 0,
    };
    if (currentLevel === "challenging" && passed) updateData.completed = 1;
    updateProgress.mutate(updateData);
    setShowResults(true);
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!lesson) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  // answersTick is read here to ensure React re-renders when answers change
  void answersTick;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
            <p className="text-sm text-gray-600">{lesson.description}</p>
          </div>
          <Button variant="ghost" onClick={onClose}><X className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 space-y-6">

          {/* Lesson video */}
          {!showSolutionVideo && (
            <Card>
              <CardHeader><CardTitle>Lesson Video</CardTitle></CardHeader>
              <CardContent><BunnyVideoPlayer videoId={lesson.videoId} /></CardContent>
            </Card>
          )}

          {/* Solution video */}
          {showSolutionVideo && currentExercise?.solutionVideoId && (
            <Card className="border-orange-300 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-900">Solution Video</CardTitle>
                <CardDescription className="text-orange-700">
                  ⚠️ This question will not count toward your final score
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BunnyVideoPlayer videoId={currentExercise.solutionVideoId} />
                <Button onClick={() => setShowSolutionVideo(false)} className="mt-4" variant="outline">
                  Back to Question
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Level selector */}
          <Card>
            <CardHeader><CardTitle>Exercise Levels</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {(["easy", "medium", "challenging"] as Difficulty[]).map(level => {
                  const unlocked = isLevelUnlocked(level);
                  const result = levelResults[level];
                  const dbPassed = progress?.[`${level}Completed`] === 1;
                  return (
                    <Button
                      key={level}
                      variant={currentLevel === level ? "default" : "outline"}
                      onClick={() => {
                        if (!unlocked) {
                          toast.error(`Complete ${level === "medium" ? "Easy" : "Medium"} level first!`);
                          return;
                        }
                        resetSession(level);
                      }}
                      disabled={!unlocked}
                      className={dbPassed || result?.passed ? "border-green-500 bg-green-50" : ""}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-semibold capitalize">{level}</span>
                        {(dbPassed || result?.passed) && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                        {!unlocked && <span className="text-xs text-gray-500">🔒 Locked</span>}
                        {result && <span className="text-xs">{result.score}/{result.total}</span>}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {showResults && levelResults[currentLevel] && (
            <Card className={levelResults[currentLevel]!.passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {levelResults[currentLevel]!.passed
                    ? <><CheckCircle2 className="w-6 h-6 text-green-600" /><span className="text-green-900">Congratulations! You Passed!</span></>
                    : <><XCircle className="w-6 h-6 text-red-600" /><span className="text-red-900">Keep Trying!</span></>
                  }
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-lg">
                  <p>You watched <strong>{exercises.filter(ex => answersRef.current[ex.id]?.solutionWatched).length}</strong> solutions</p>
                  <p>You got <strong>{levelResults[currentLevel]!.score}</strong> correct</p>
                  <p className="text-2xl font-bold mt-2">Your score: {levelResults[currentLevel]!.score}/{levelResults[currentLevel]!.total}</p>
                </div>
                <div className="flex gap-4 flex-wrap">
                  <Button onClick={() => resetSession()} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart {currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)}
                  </Button>
                  {levelResults[currentLevel]!.passed && currentLevel !== "challenging" && (
                    <Button onClick={() => resetSession(currentLevel === "easy" ? "medium" : "challenging")}>
                      Next Level: {currentLevel === "easy" ? "Medium" : "Challenging"}
                    </Button>
                  )}
                  {levelResults[currentLevel]!.passed && currentLevel === "challenging" && (
                    <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">Complete Lesson</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Exercise interface */}
          {!showResults && exercises.length > 0 && currentExercise && (() => {
            const opts = getOptions(currentExercise);
            const currentAnswer = answersRef.current[currentExercise.id];
            const allQuestionsAnswered = exercises.length > 0 &&
              exercises.every(ex => !!answersRef.current[ex.id]?.selectedLabel);
            return (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Question {currentQuestionIndex + 1} of {exercises.length}</CardTitle>
                      <CardDescription className="capitalize">
                        {currentLevel} Level
                        {currentAnswer?.solutionWatched && (
                          <span className="ml-2 text-orange-600 font-semibold">(Solution watched — won't count)</span>
                        )}
                      </CardDescription>
                    </div>
                    {currentExercise.solutionVideoId && (
                      <Button
                        variant="outline" size="sm"
                        onClick={handleWatchSolution}
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />Watch Solution
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Question text */}
                  <div className="text-lg font-medium">
                    <FractionRenderer text={currentExercise.question} />
                  </div>

                  {/* Diagram */}
                  {currentExercise.imageUrl && (
                    <div className="flex justify-center">
                      <img
                        src={currentExercise.imageUrl}
                        alt="Question diagram"
                        className="max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm object-contain"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}

                  {/* Answer options */}
                  <RadioGroup
                    value={currentAnswer?.selectedLabel ?? ""}
                    onValueChange={label => {
                      const opt = opts.find(o => o.label === label);
                      if (opt) handleOptionSelect(opt);
                    }}
                  >
                    <div className="space-y-3">
                      {opts.map(opt => (
                        <div
                          key={opt.label}
                          className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                            currentAnswer?.selectedLabel === opt.label
                              ? "bg-blue-50 border-blue-400"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleOptionSelect(opt)}
                        >
                          <RadioGroupItem value={opt.label} id={`opt-${currentExercise.id}-${opt.label}`} />
                          <Label htmlFor={`opt-${currentExercise.id}-${opt.label}`} className="flex-1 cursor-pointer">
                            <span className="font-semibold mr-2">{opt.label}.</span>
                            <FractionRenderer text={opt.text} />
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Previous
                    </Button>
                    <div className="text-sm text-gray-600">
                      {exercises.filter(ex => !!answersRef.current[ex.id]?.selectedLabel).length} / {exercises.length} answered
                    </div>
                    {currentQuestionIndex < exercises.length - 1 ? (
                      <Button onClick={handleNext}>Next</Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Answers
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {exercises.length === 0 && !lessonLoading && (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No exercises available for this level yet.
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
