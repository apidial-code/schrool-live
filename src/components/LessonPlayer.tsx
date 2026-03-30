import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  text: string;
  answers: string[];
  correctAnswerIndex: number;
  solutionVideoUrl?: string;
  difficulty: 'Easy' | 'Medium' | 'Challenging';
}

interface LessonPlayerProps {
  lessonId: number;
  lessonTitle: string;
  lessonDescription: string;
  introVideoUrl: string;
  questions: Question[];
  onComplete?: (score: number, difficulty: string) => void;
}

export function LessonPlayer({
  lessonId,
  lessonTitle,
  lessonDescription,
  introVideoUrl,
  questions,
  onComplete,
}: LessonPlayerProps) {
  const [currentDifficulty, setCurrentDifficulty] = useState<'Easy' | 'Medium' | 'Challenging'>('Easy');
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [videoWatched, setVideoWatched] = useState<Record<number, boolean>>({});
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

  const handleSelectAnswer = (questionIdx: number, answerIdx: number) => {
    if (submitted || videoWatched[questionIdx]) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionIdx]: answerIdx,
    }));
  };

  const handleWatchSolution = (questionIdx: number) => {
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

  const handleSwitchDifficulty = (difficulty: 'Easy' | 'Medium' | 'Challenging') => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">{lessonTitle}</h1>
        <p className="text-lg opacity-90">{lessonDescription}</p>
      </Card>

      {/* Intro Video */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">📹 Lesson Introduction</h2>
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={introVideoUrl}
            className="w-full h-full"
            allowFullScreen
            title="Lesson Introduction"
          />
        </div>
      </Card>

      {/* Difficulty Selector */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Choose Difficulty Level</h2>
        <div className="flex gap-4 flex-wrap">
          {(['Easy', 'Medium', 'Challenging'] as const).map(difficulty => (
            <Button
              key={difficulty}
              onClick={() => handleSwitchDifficulty(difficulty)}
              variant={currentDifficulty === difficulty ? 'default' : 'outline'}
              className={currentDifficulty === difficulty ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : ''}
            >
              {difficulty === 'Easy' && '⭐'} {difficulty === 'Medium' && '⭐⭐'} {difficulty === 'Challenging' && '⭐⭐⭐'} {difficulty}
            </Button>
          ))}
        </div>
      </Card>

      {/* Questions Section */}
      <Card className="p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Progress</span>
            <span className="font-semibold">{score}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Score Display */}
        <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-600 rounded">
          <span className="font-bold text-lg">Score: <span className="text-purple-600">{score}</span>/10</span>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          {randomizedQuestions.map((question, index) => {
            const isAnswered = userAnswers[index] !== undefined;
            const isVideoWatched = videoWatched[index];
            const selectedAnswer = isAnswered ? question.randomizedAnswers[userAnswers[index]] : null;
            const isCorrect = selectedAnswer?.isCorrect;

            return (
              <div key={question.id} className="border-l-4 border-purple-600 pl-4 py-2">
                <div className="text-sm text-gray-500 mb-2">Question {index + 1}</div>
                <div className="text-lg font-semibold mb-4">{question.text}</div>

                {/* Answer Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {question.randomizedAnswers.map((answer, answerIdx) => {
                    let buttonClass = 'border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50';

                    if (submitted) {
                      if (answer.isCorrect) {
                        buttonClass = 'border-2 border-green-500 bg-green-100 text-green-900';
                      } else if (userAnswers[index] === answerIdx && !isCorrect) {
                        buttonClass = 'border-2 border-red-500 bg-red-100 text-red-900';
                      }
                    } else if (isVideoWatched) {
                      buttonClass = 'border-2 border-orange-500 bg-orange-50 opacity-50 cursor-not-allowed';
                    } else if (userAnswers[index] === answerIdx) {
                      buttonClass = 'border-2 border-purple-600 bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
                    }

                    return (
                      <Button
                        key={answer.id}
                        onClick={() => handleSelectAnswer(index, answerIdx)}
                        disabled={submitted || isVideoWatched}
                        className={`justify-start h-auto py-3 px-4 ${buttonClass}`}
                        variant="outline"
                      >
                        {answer.text}
                      </Button>
                    );
                  })}
                </div>

                {/* Solution Video */}
                {question.solutionVideoUrl && (
                  <div>
                    <Button
                      onClick={() => handleWatchSolution(index)}
                      disabled={isVideoWatched}
                      variant="outline"
                      className="mb-3"
                    >
                      📹 Watch Solution
                    </Button>

                    {isVideoWatched && (
                      <>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden mb-3">
                          <iframe
                            src={question.solutionVideoUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title={`Solution for Question ${index + 1}`}
                          />
                        </div>
                        <div className="p-3 bg-orange-50 border-l-4 border-orange-500 text-orange-900 rounded text-sm">
                          ⚠️ Solution watched - this answer will not be counted as correct
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 flex-wrap">
          <Button
            onClick={handleSubmitAnswers}
            disabled={submitted}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
          >
            Submit Answers
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 min-w-[200px]"
          >
            Reset
          </Button>
        </div>

        {/* Result Message */}
        {submitted && (
          <div className={`mt-6 p-4 rounded-lg text-center font-semibold ${
            passed
              ? 'bg-green-100 text-green-900 border-l-4 border-green-500'
              : 'bg-red-100 text-red-900 border-l-4 border-red-500'
          }`}>
            {passed ? (
              <>
                ✅ Congratulations! You passed with {score}/10!<br />
                You can now proceed to the next difficulty level.
              </>
            ) : (
              <>
                ❌ You scored {score}/10. You need 8/10 to pass.<br />
                Please try again!
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
