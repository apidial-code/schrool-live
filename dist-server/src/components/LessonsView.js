import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export function LessonsView() {
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [currentDifficulty, setCurrentDifficulty] = useState('easy');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const { data: lessons, isLoading: lessonsLoading } = trpc.lessons.list.useQuery();
    const { data: lesson, isLoading: lessonLoading } = trpc.lessons.getById.useQuery({ lessonId: selectedLesson || 0 }, { enabled: !!selectedLesson });
    const { data: exercisesData } = trpc.lessons.getExercises.useQuery({ lessonId: selectedLesson || 0 }, { enabled: !!selectedLesson });
    const { data: progress } = trpc.progress.getUserProgress.useQuery();
    const submitMutation = trpc.progress.updateLessonProgress.useMutation();
    if (lessonsLoading)
        return _jsx("div", { className: "p-4", children: "Loading lessons..." });
    if (!selectedLesson) {
        return (_jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold mb-6 text-blue-600", children: "\uD83D\uDCDA Math Lessons" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: lessons?.map((l) => {
                        const lessonProgress = progress?.find((p) => p.lessonId === l.id);
                        const allLevelsComplete = progress?.some((p) => p.lessonId === l.id && p.completed);
                        return (_jsxs(Card, { className: "p-4 cursor-pointer hover:shadow-lg transition-shadow", onClick: () => setSelectedLesson(l.id), children: [_jsx("h3", { className: "font-bold text-lg mb-2", children: l.title }), _jsx("p", { className: "text-sm text-gray-600 mb-4", children: l.description }), _jsx("div", { className: "space-y-2", children: ['easy', 'medium', 'challenging'].map((level) => {
                                        const levelProgress = progress?.find((p) => p.lessonId === l.id);
                                        return (_jsxs("div", { className: "text-sm", children: [_jsxs("span", { className: "capitalize font-semibold", children: [level, ":"] }), levelProgress?.completed ? (_jsxs("span", { className: "ml-2 text-green-600", children: ["\u2713 Complete (", levelProgress.correctAnswers, "/10)"] })) : levelProgress ? (_jsxs("span", { className: "ml-2 text-yellow-600", children: ["In Progress (", levelProgress.correctAnswers, "/10)"] })) : (_jsx("span", { className: "ml-2 text-gray-400", children: "Not started" }))] }, level));
                                    }) }), allLevelsComplete && (_jsx("div", { className: "mt-4 p-2 bg-green-100 rounded text-green-800 text-sm font-semibold", children: "\uD83C\uDF89 Lesson Complete!" }))] }, l.id));
                    }) })] }));
    }
    if (lessonLoading)
        return _jsx("div", { className: "p-4", children: "Loading lesson..." });
    const currentExercises = (exercisesData || []).filter((e) => e.difficulty === currentDifficulty);
    const currentExercise = currentExercises[currentQuestion];
    if (!currentExercise) {
        return _jsx("div", { className: "p-4", children: "No exercises found" });
    }
    const handleSubmitLevel = async () => {
        const result = await submitMutation.mutateAsync({
            lessonId: selectedLesson,
            score: Object.values(answers).filter(Boolean).length,
            completed: 1,
        });
        if (result?.passed) {
            alert(`🎉 Passed! Score: ${result?.score}/10`);
            if (currentDifficulty === 'easy') {
                setCurrentDifficulty('medium');
            }
            else if (currentDifficulty === 'medium') {
                setCurrentDifficulty('challenging');
            }
            else {
                setSelectedLesson(null);
            }
            setCurrentQuestion(0);
            setAnswers({});
        }
        else {
            alert(`Try again! Score: ${result?.score}/10 (need 8/10)`);
        }
    };
    return (_jsxs("div", { className: "p-6 max-w-2xl mx-auto", children: [_jsx(Button, { onClick: () => setSelectedLesson(null), className: "mb-4", variant: "outline", children: "\u2190 Back to Lessons" }), _jsx("h2", { className: "text-2xl font-bold mb-4", children: lesson?.title }), _jsx("div", { className: "mb-6 aspect-video bg-black rounded-lg overflow-hidden", children: _jsx("iframe", { src: `https://iframe.mediadelivery.net/embed/360729/${lesson?.videoId}`, frameBorder: "0", allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "w-full h-full" }) }), _jsx("div", { className: "flex gap-2 mb-6 border-b", children: ['easy', 'medium', 'challenging'].map((level) => (_jsxs("button", { onClick: () => {
                        setCurrentDifficulty(level);
                        setCurrentQuestion(0);
                        setAnswers({});
                    }, className: `px-4 py-2 capitalize font-semibold border-b-2 transition-colors ${currentDifficulty === level
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'}`, children: [level, " (10 Q)"] }, level))) }), _jsx("div", { className: "mb-6 bg-gray-200 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "bg-blue-600 h-full transition-all", style: { width: `${((currentQuestion + 1) / 10) * 100}%` } }) }), _jsxs(Card, { className: "p-6 mb-6", children: [_jsxs("h3", { className: "font-bold mb-4", children: ["Question ", currentQuestion + 1, "/10"] }), _jsx("p", { className: "mb-6 text-lg", children: currentExercise.question }), _jsx("div", { className: "space-y-3 mb-6", children: JSON.parse(currentExercise.options || "[]").map((option, idx) => (_jsxs("label", { className: `flex items-center p-3 border-2 rounded cursor-pointer transition-colors ${answers[currentExercise.id] === idx
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-300 hover:border-gray-400'}`, children: [_jsx("input", { type: "radio", name: "answer", value: idx, checked: answers[currentExercise.id] === idx, onChange: () => setAnswers({ ...answers, [currentExercise.id]: idx }), className: "mr-3" }), _jsx("span", { children: option })] }, idx))) }), currentExercise.solutionVideoId && (_jsxs("details", { className: "mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded", children: [_jsx("summary", { className: "cursor-pointer font-semibold text-yellow-800", children: "\uD83D\uDCA1 View Solution Video" }), _jsx("div", { className: "mt-4 aspect-video bg-black rounded overflow-hidden", children: _jsx("iframe", { src: `https://iframe.mediadelivery.net/embed/360729/${currentExercise.solutionVideoId}`, frameBorder: "0", allow: "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture", allowFullScreen: true, className: "w-full h-full" }) })] })), _jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: () => setCurrentQuestion(Math.max(0, currentQuestion - 1)), disabled: currentQuestion === 0, variant: "outline", children: "\u2190 Previous" }), _jsx(Button, { onClick: () => setCurrentQuestion(Math.min(9, currentQuestion + 1)), disabled: currentQuestion === 9, variant: "outline", children: "Next \u2192" })] })] }), _jsx(Button, { onClick: handleSubmitLevel, className: "w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg", disabled: submitMutation.isPending, children: submitMutation.isPending ? 'Submitting...' : `Submit ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level` })] }));
}
