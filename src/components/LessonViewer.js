import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BunnyVideoPlayer } from "./BunnyVideoPlayer";
import { X, RotateCcw, CheckCircle2, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
/**
 * Renders text with proper school-style fractions.
 * Detects patterns like "1/2" or "2 3/4" and renders them vertically.
 */
function FractionRenderer({ text }) {
    if (!text)
        return null;
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
        parts.push(_jsxs("span", { className: "inline-flex items-center align-middle mx-0.5", children: [wholeNumber && _jsx("span", { className: "mr-1", children: wholeNumber }), _jsxs("span", { className: "inline-flex flex-col items-center text-[0.85em] leading-none", children: [_jsx("span", { className: "pb-0.5 border-b border-current min-w-[1.2em] text-center", children: numerator }), _jsx("span", { className: "pt-0.5 min-w-[1.2em] text-center", children: denominator })] })] }, match.index));
        lastIndex = fractionRegex.lastIndex;
    }
    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    return _jsx("span", { className: "inline-block", children: parts.length > 0 ? parts : text });
}
// ─── Seeded Fisher-Yates shuffle ─────────────────────────────────────────────
function seededShuffle(arr, seed) {
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
function buildDisplayOptions(ex, seed) {
    let rawOptions = [];
    try {
        if (ex.options)
            rawOptions = JSON.parse(ex.options);
    }
    catch { /* ignore */ }
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
export function LessonViewer({ lessonId, onClose }) {
    const [currentLevel, setCurrentLevel] = useState("easy");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [showSolutionVideo, setShowSolutionVideo] = useState(false);
    const [levelResults, setLevelResults] = useState({});
    const [lesson, setLesson] = useState(null);
    const [allExercises, setAllExercises] = useState([]);
    const [lessonLoading, setLessonLoading] = useState(true);
    // ── Per-question answers — stored in a ref so updates never trigger re-renders
    // that could invalidate memos. We also keep a parallel state copy just for
    // forcing re-renders when we need the UI to update (e.g. highlight selection).
    const answersRef = useRef({});
    const [answersTick, setAnswersTick] = useState(0); // increment to force re-render
    // ── Shuffled options stored in a ref — built once per session, never re-built
    // unless the user explicitly restarts (which calls resetSession).
    const optionsRef = useRef({});
    const sessionSeedRef = useRef((Math.random() * 0xffffffff) >>> 0);
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
                if (cancelled)
                    return;
                if (lRes.ok)
                    setLesson(await lRes.json());
                if (eRes.ok)
                    setAllExercises(await eRes.json());
            }
            catch (err) {
                console.error("[LessonViewer] fetch error:", err);
            }
            finally {
                if (!cancelled)
                    setLessonLoading(false);
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
    const getOptions = (ex) => {
        if (!optionsRef.current[ex.id]) {
            optionsRef.current[ex.id] = buildDisplayOptions(ex, sessionSeedRef.current);
        }
        return optionsRef.current[ex.id];
    };
    // ── Reset everything for a fresh session ──────────────────────────────────
    const resetSession = (level) => {
        sessionSeedRef.current = (Math.random() * 0xffffffff) >>> 0;
        optionsRef.current = {}; // clear cached options so they rebuild with new seed
        answersRef.current = {}; // clear all answers
        setCurrentQuestionIndex(0);
        setShowResults(false);
        setShowSolutionVideo(false);
        setAnswersTick(t => t + 1);
        if (level)
            setCurrentLevel(level);
    };
    // ── Level unlock logic ─────────────────────────────────────────────────────
    const isLevelUnlocked = (level) => {
        if (level === "easy")
            return true;
        if (level === "medium")
            return progress?.easyCompleted === 1 || !!levelResults.easy?.passed;
        if (level === "challenging")
            return progress?.mediumCompleted === 1 || !!levelResults.medium?.passed;
        return false;
    };
    // ── Handle student selecting an option ────────────────────────────────────
    // isCorrect is captured HERE at click time and stored immediately.
    // Scoring at submit time simply reads this stored flag — no lookup, no comparison.
    const handleOptionSelect = (opt) => {
        if (!currentExercise)
            return;
        answersRef.current[currentExercise.id] = {
            selectedLabel: opt.label,
            isCorrect: opt.isCorrect,
            solutionWatched: answersRef.current[currentExercise.id]?.solutionWatched ?? false,
        };
        setAnswersTick(t => t + 1); // trigger re-render to show selection highlight
    };
    const handleWatchSolution = () => {
        if (!currentExercise)
            return;
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
            if (ans && !ans.solutionWatched && ans.isCorrect)
                correctCount++;
        });
        const passed = correctCount >= 8;
        setLevelResults(prev => ({ ...prev, [currentLevel]: { score: correctCount, total: exercises.length, passed } }));
        const updateData = {
            lessonId,
            difficulty: currentLevel,
            score: correctCount,
        };
        updateProgress.mutate(updateData);
        setShowResults(true);
    };
    // ── Loading ────────────────────────────────────────────────────────────────
    if (!lesson) {
        return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white rounded-lg p-8 text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading lesson..." })] }) }));
    }
    // ── Render ─────────────────────────────────────────────────────────────────
    // answersTick is read here to ensure React re-renders when answers change
    void answersTick;
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto", children: _jsxs("div", { className: "bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: lesson.title }), _jsx("p", { className: "text-sm text-gray-600", children: lesson.description })] }), _jsx(Button, { variant: "ghost", onClick: onClose, children: _jsx(X, { className: "w-5 h-5" }) })] }), _jsxs("div", { className: "p-6 space-y-6", children: [!showSolutionVideo && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Lesson Video" }) }), _jsx(CardContent, { children: _jsx(BunnyVideoPlayer, { videoId: lesson.videoId }) })] })), showSolutionVideo && currentExercise?.solutionVideoId && (_jsxs(Card, { className: "border-orange-300 bg-orange-50", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-orange-900", children: "Solution Video" }), _jsx(CardDescription, { className: "text-orange-700", children: "\u26A0\uFE0F This question will not count toward your final score" })] }), _jsxs(CardContent, { children: [_jsx(BunnyVideoPlayer, { videoId: currentExercise.solutionVideoId }), _jsx(Button, { onClick: () => setShowSolutionVideo(false), className: "mt-4", variant: "outline", children: "Back to Question" })] })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Exercise Levels" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-3 gap-4", children: ["easy", "medium", "challenging"].map(level => {
                                            const unlocked = isLevelUnlocked(level);
                                            const result = levelResults[level];
                                            const dbPassed = progress?.[`${level}Completed`] === 1;
                                            return (_jsx(Button, { variant: currentLevel === level ? "default" : "outline", onClick: () => {
                                                    if (!unlocked) {
                                                        toast.error(`Complete ${level === "medium" ? "Easy" : "Medium"} level first!`);
                                                        return;
                                                    }
                                                    resetSession(level);
                                                }, disabled: !unlocked, className: dbPassed || result?.passed ? "border-green-500 bg-green-50" : "", children: _jsxs("div", { className: "flex flex-col items-center gap-1", children: [_jsx("span", { className: "font-semibold capitalize", children: level }), (dbPassed || result?.passed) && _jsx(CheckCircle2, { className: "w-4 h-4 text-green-600" }), !unlocked && _jsx("span", { className: "text-xs text-gray-500", children: "\uD83D\uDD12 Locked" }), result && _jsxs("span", { className: "text-xs", children: [result.score, "/", result.total] })] }) }, level));
                                        }) }) })] }), showResults && levelResults[currentLevel] && (_jsxs(Card, { className: levelResults[currentLevel].passed ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50", children: [_jsx(CardHeader, { children: _jsx(CardTitle, { className: "flex items-center gap-2", children: levelResults[currentLevel].passed
                                            ? _jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-6 h-6 text-green-600" }), _jsx("span", { className: "text-green-900", children: "Congratulations! You Passed!" })] })
                                            : _jsxs(_Fragment, { children: [_jsx(XCircle, { className: "w-6 h-6 text-red-600" }), _jsx("span", { className: "text-red-900", children: "Keep Trying!" })] }) }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "text-lg", children: [_jsxs("p", { children: ["You watched ", _jsx("strong", { children: exercises.filter(ex => answersRef.current[ex.id]?.solutionWatched).length }), " solutions"] }), _jsxs("p", { children: ["You got ", _jsx("strong", { children: levelResults[currentLevel].score }), " correct"] }), _jsxs("p", { className: "text-2xl font-bold mt-2", children: ["Your score: ", levelResults[currentLevel].score, "/", levelResults[currentLevel].total] })] }), _jsxs("div", { className: "flex gap-4 flex-wrap", children: [_jsxs(Button, { onClick: () => resetSession(), variant: "outline", children: [_jsx(RotateCcw, { className: "w-4 h-4 mr-2" }), "Restart ", currentLevel.charAt(0).toUpperCase() + currentLevel.slice(1)] }), levelResults[currentLevel].passed && currentLevel !== "challenging" && (_jsxs(Button, { onClick: () => resetSession(currentLevel === "easy" ? "medium" : "challenging"), children: ["Next Level: ", currentLevel === "easy" ? "Medium" : "Challenging"] })), levelResults[currentLevel].passed && currentLevel === "challenging" && (_jsx(Button, { onClick: onClose, className: "bg-green-600 hover:bg-green-700", children: "Complete Lesson" }))] })] })] })), !showResults && exercises.length > 0 && currentExercise && (() => {
                            const opts = getOptions(currentExercise);
                            const currentAnswer = answersRef.current[currentExercise.id];
                            const allQuestionsAnswered = exercises.length > 0 &&
                                exercises.every(ex => !!answersRef.current[ex.id]?.selectedLabel);
                            return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { children: ["Question ", currentQuestionIndex + 1, " of ", exercises.length] }), _jsxs(CardDescription, { className: "capitalize", children: [currentLevel, " Level", currentAnswer?.solutionWatched && (_jsx("span", { className: "ml-2 text-orange-600 font-semibold", children: "(Solution watched \u2014 won't count)" }))] })] }), currentExercise.solutionVideoId && (_jsxs(Button, { variant: "outline", size: "sm", onClick: handleWatchSolution, className: "border-orange-300 text-orange-700 hover:bg-orange-50", children: [_jsx(Eye, { className: "w-4 h-4 mr-2" }), "Watch Solution"] }))] }) }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "text-lg font-medium", children: _jsx(FractionRenderer, { text: currentExercise.question }) }), currentExercise.imageUrl && (_jsx("div", { className: "flex justify-center", children: _jsx("img", { src: currentExercise.imageUrl, alt: "Question diagram", className: "max-h-64 max-w-full rounded-lg border border-gray-200 shadow-sm object-contain", onError: e => { e.target.style.display = "none"; } }) })), _jsx(RadioGroup, { value: currentAnswer?.selectedLabel ?? "", onValueChange: label => {
                                                    const opt = opts.find(o => o.label === label);
                                                    if (opt)
                                                        handleOptionSelect(opt);
                                                }, children: _jsx("div", { className: "space-y-3", children: opts.map(opt => (_jsxs("div", { className: `flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${currentAnswer?.selectedLabel === opt.label
                                                            ? "bg-blue-50 border-blue-400"
                                                            : "hover:bg-gray-50"}`, onClick: () => handleOptionSelect(opt), children: [_jsx(RadioGroupItem, { value: opt.label, id: `opt-${currentExercise.id}-${opt.label}` }), _jsxs(Label, { htmlFor: `opt-${currentExercise.id}-${opt.label}`, className: "flex-1 cursor-pointer", children: [_jsxs("span", { className: "font-semibold mr-2", children: [opt.label, "."] }), _jsx(FractionRenderer, { text: opt.text })] })] }, opt.label))) }) }), _jsxs("div", { className: "flex items-center justify-between pt-4 border-t", children: [_jsx(Button, { variant: "outline", onClick: handlePrevious, disabled: currentQuestionIndex === 0, children: "Previous" }), _jsxs("div", { className: "text-sm text-gray-600", children: [exercises.filter(ex => !!answersRef.current[ex.id]?.selectedLabel).length, " / ", exercises.length, " answered"] }), currentQuestionIndex < exercises.length - 1 ? (_jsx(Button, { onClick: handleNext, children: "Next" })) : (_jsx(Button, { onClick: handleSubmit, disabled: !allQuestionsAnswered, className: "bg-blue-600 hover:bg-blue-700", children: "Submit Answers" }))] })] })] }));
                        })(), exercises.length === 0 && !lessonLoading && (_jsx(Card, { children: _jsx(CardContent, { className: "py-8 text-center text-gray-500", children: "No exercises available for this level yet." }) }))] })] }) }));
}
