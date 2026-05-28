import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export function LessonPlayer({ lessonId, lessonTitle, lessonDescription, introVideoUrl, questions, onComplete, }) {
    const [currentDifficulty, setCurrentDifficulty] = useState('Easy');
    const [userAnswers, setUserAnswers] = useState({});
    const [videoWatched, setVideoWatched] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    // Filter questions by difficulty
    const currentQuestions = useMemo(() => {
        return questions.filter(q => q.difficulty === currentDifficulty);
    }, [questions, currentDifficulty]);
    // Randomize answers for each question
    const randomizedQuestions = useMemo(() => {
        return currentQuestions.map(question => {
            const answers = question.answers.map((text, idx) => ({
                id: idx,
                text: text,
                isCorrect: idx === question.correctAnswerIndex,
            }));
            const randomized = [...answers].sort(() => Math.random() - 0.5);
            return {
                ...question,
                randomizedAnswers: randomized,
                originalCorrectIndex: question.correctAnswerIndex,
            };
        });
    }, [currentQuestions]);
    const handleSelectAnswer = (questionIdx, answerIdx) => {
        if (submitted || videoWatched[questionIdx])
            return;
        setUserAnswers(prev => ({
            ...prev,
            [questionIdx]: answerIdx,
        }));
    };
    const handleWatchSolution = (questionIdx) => {
        setVideoWatched(prev => ({
            ...prev,
            [questionIdx]: true,
        }));
        // Clear the answer if solution is watched
        setUserAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[questionIdx];
            return newAnswers;
        });
    };
    const handleSubmitAnswers = () => {
        if (Object.keys(userAnswers).length === 0) {
            alert('Please answer at least one question!');
            return;
        }
        setSubmitted(true);
        let correctCount = 0;
        randomizedQuestions.forEach((question, index) => {
            // If video was watched, don't count as correct
            if (videoWatched[index]) {
                return;
            }
            // Check if answer is correct
            if (userAnswers[index] !== undefined) {
                const selectedAnswer = question.randomizedAnswers[userAnswers[index]];
                if (selectedAnswer.isCorrect) {
                    correctCount++;
                }
            }
        });
        setScore(correctCount);
        if (onComplete) {
            onComplete(correctCount, currentDifficulty);
        }
    };
    const handleReset = () => {
        setUserAnswers({});
        setVideoWatched({});
        setSubmitted(false);
        setScore(0);
    };
    const handleSwitchDifficulty = (difficulty) => {
        if (submitted) {
            if (!window.confirm('Switching difficulty will reset your progress. Continue?')) {
                return;
            }
        }
        setCurrentDifficulty(difficulty);
        handleReset();
    };
    const progressPercentage = (score / 10) * 100;
    const passed = score >= 8;
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8", children: [_jsx("h1", { className: "text-4xl font-bold mb-2", children: lessonTitle }), _jsx("p", { className: "text-lg opacity-90", children: lessonDescription })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-purple-600 mb-4", children: "\uD83D\uDCF9 Lesson Introduction" }), _jsx("div", { className: "aspect-video bg-black rounded-lg overflow-hidden", children: _jsx("iframe", { src: introVideoUrl, className: "w-full h-full", allowFullScreen: true, title: "Lesson Introduction" }) })] }), _jsxs(Card, { className: "p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-purple-600 mb-4", children: "Choose Difficulty Level" }), _jsx("div", { className: "flex gap-4 flex-wrap", children: ['Easy', 'Medium', 'Challenging'].map(difficulty => (_jsxs(Button, { onClick: () => handleSwitchDifficulty(difficulty), variant: currentDifficulty === difficulty ? 'default' : 'outline', className: currentDifficulty === difficulty ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : '', children: [difficulty === 'Easy' && '⭐', " ", difficulty === 'Medium' && '⭐⭐', " ", difficulty === 'Challenging' && '⭐⭐⭐', " ", difficulty] }, difficulty))) })] }), _jsxs(Card, { className: "p-6", children: [_jsxs("div", { className: "mb-6", children: [_jsxs("div", { className: "flex justify-between mb-2", children: [_jsx("span", { className: "font-semibold", children: "Progress" }), _jsxs("span", { className: "font-semibold", children: [score, "/10"] })] }), _jsx("div", { className: "w-full bg-gray-200 rounded-full h-3 overflow-hidden", children: _jsx("div", { className: "bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-300", style: { width: `${progressPercentage}%` } }) })] }), _jsx("div", { className: "mb-6 p-4 bg-purple-50 border-l-4 border-purple-600 rounded", children: _jsxs("span", { className: "font-bold text-lg", children: ["Score: ", _jsx("span", { className: "text-purple-600", children: score }), "/10"] }) }), _jsx("div", { className: "space-y-6", children: randomizedQuestions.map((question, index) => {
                            const isAnswered = userAnswers[index] !== undefined;
                            const isVideoWatched = videoWatched[index];
                            const selectedAnswer = isAnswered ? question.randomizedAnswers[userAnswers[index]] : null;
                            const isCorrect = selectedAnswer?.isCorrect;
                            return (_jsxs("div", { className: "border-l-4 border-purple-600 pl-4 py-2", children: [_jsxs("div", { className: "text-sm text-gray-500 mb-2", children: ["Question ", index + 1] }), _jsx("div", { className: "text-lg font-semibold mb-4", children: question.text }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mb-4", children: question.randomizedAnswers.map((answer, answerIdx) => {
                                            let buttonClass = 'border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50';
                                            if (submitted) {
                                                if (answer.isCorrect) {
                                                    buttonClass = 'border-2 border-green-500 bg-green-100 text-green-900';
                                                }
                                                else if (userAnswers[index] === answerIdx && !isCorrect) {
                                                    buttonClass = 'border-2 border-red-500 bg-red-100 text-red-900';
                                                }
                                            }
                                            else if (isVideoWatched) {
                                                buttonClass = 'border-2 border-orange-500 bg-orange-50 opacity-50 cursor-not-allowed';
                                            }
                                            else if (userAnswers[index] === answerIdx) {
                                                buttonClass = 'border-2 border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
                                            }
                                            return (_jsx(Button, { onClick: () => handleSelectAnswer(index, answerIdx), disabled: submitted || isVideoWatched, className: `justify-start h-auto py-3 px-4 ${buttonClass}`, variant: "outline", children: answer.text }, answer.id));
                                        }) }), question.solutionVideoUrl && (_jsxs("div", { children: [_jsx(Button, { onClick: () => handleWatchSolution(index), disabled: isVideoWatched, variant: "outline", className: "mb-3", children: "\uD83D\uDCF9 Watch Solution" }), isVideoWatched && (_jsxs(_Fragment, { children: [_jsx("div", { className: "aspect-video bg-black rounded-lg overflow-hidden mb-3", children: _jsx("iframe", { src: question.solutionVideoUrl, className: "w-full h-full", allowFullScreen: true, title: `Solution for Question ${index + 1}` }) }), _jsx("div", { className: "p-3 bg-orange-50 border-l-4 border-orange-500 text-orange-900 rounded text-sm", children: "\u26A0\uFE0F Solution watched - this answer will not be counted as correct" })] }))] }))] }, question.id));
                        }) }), _jsxs("div", { className: "flex gap-4 mt-8 flex-wrap", children: [_jsx(Button, { onClick: handleSubmitAnswers, disabled: submitted, className: "flex-1 min-w-[200px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white", children: "Submit Answers" }), _jsx(Button, { onClick: handleReset, variant: "outline", className: "flex-1 min-w-[200px]", children: "Reset" })] }), submitted && (_jsx("div", { className: `mt-6 p-4 rounded-lg text-center font-semibold ${passed
                            ? 'bg-green-100 text-green-900 border-l-4 border-green-500'
                            : 'bg-red-100 text-red-900 border-l-4 border-red-500'}`, children: passed ? (_jsxs(_Fragment, { children: ["\u2705 Congratulations! You passed with ", score, "/10!", _jsx("br", {}), "You can now proceed to the next difficulty level."] })) : (_jsxs(_Fragment, { children: ["\u274C You scored ", score, "/10. You need 8/10 to pass.", _jsx("br", {}), "Please try again!"] })) }))] })] }));
}
