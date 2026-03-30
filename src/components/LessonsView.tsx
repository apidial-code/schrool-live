import React, { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function LessonsView() {
  const [selectedLesson, setSelectedLesson] = useState<number | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'medium' | 'challenging'>('easy');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  const { data: lessons, isLoading: lessonsLoading } = trpc.lessons.list.useQuery();
  const { data: lesson, isLoading: lessonLoading } = trpc.lessons.getById.useQuery(
    { lessonId: selectedLesson || 0 },
    { enabled: !!selectedLesson }
  );
  const { data: exercisesData } = trpc.lessons.getExercises.useQuery(
    { lessonId: selectedLesson || 0 },
    { enabled: !!selectedLesson }
  );
  const { data: progress } = trpc.progress.getUserProgress.useQuery();
  const submitMutation = trpc.progress.updateLessonProgress.useMutation();

  if (lessonsLoading) return <div className="p-4">Loading lessons...</div>;

  if (!selectedLesson) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-600">📚 Math Lessons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lessons?.map((l: any) => {
            const lessonProgress = progress?.find((p: any) => p.lessonId === l.id);
            const allLevelsComplete = 
              progress?.some((p: any) => p.lessonId === l.id && p.completed);

            return (
              <Card
                key={l.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedLesson(l.id)}
              >
                <h3 className="font-bold text-lg mb-2">{l.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{l.description}</p>
                <div className="space-y-2">
                  {['easy', 'medium', 'challenging'].map((level) => {
                    const levelProgress = progress?.find(
                      (p: any) => p.lessonId === l.id
                    );
                    return (
                      <div key={level} className="text-sm">
                        <span className="capitalize font-semibold">{level}:</span>
                        {levelProgress?.completed ? (
                          <span className="ml-2 text-green-600">✓ Complete ({levelProgress.correctAnswers}/10)</span>
                        ) : levelProgress ? (
                          <span className="ml-2 text-yellow-600">In Progress ({levelProgress.correctAnswers}/10)</span>
                        ) : (
                          <span className="ml-2 text-gray-400">Not started</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                {allLevelsComplete && (
                  <div className="mt-4 p-2 bg-green-100 rounded text-green-800 text-sm font-semibold">
                    🎉 Lesson Complete!
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  if (lessonLoading) return <div className="p-4">Loading lesson...</div>;

  const currentExercises = (exercisesData || []).filter((e: any) => e.difficulty === currentDifficulty);
  const currentExercise = currentExercises[currentQuestion];

  if (!currentExercise) {
    return <div className="p-4">No exercises found</div>;
  }

  const handleSubmitLevel = async () => {
    const result: any = await submitMutation.mutateAsync({
      lessonId: selectedLesson!,
      score: Object.values(answers as Record<string, any>).filter(Boolean).length,
      completed: 1,
    });

    if ((result as any)?.passed) {
      alert(`🎉 Passed! Score: ${(result as any)?.score}/10`);
      if (currentDifficulty === 'easy') {
        setCurrentDifficulty('medium');
      } else if (currentDifficulty === 'medium') {
        setCurrentDifficulty('challenging');
      } else {
        setSelectedLesson(null);
      }
      setCurrentQuestion(0);
      setAnswers({});
    } else {
      alert(`Try again! Score: ${(result as any)?.score}/10 (need 8/10)`);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Button
        onClick={() => setSelectedLesson(null)}
        className="mb-4"
        variant="outline"
      >
        ← Back to Lessons
      </Button>

      <h2 className="text-2xl font-bold mb-4">{lesson?.title}</h2>

      {/* Video Player */}
      <div className="mb-6 aspect-video bg-black rounded-lg overflow-hidden">
        <iframe
          src={`https://iframe.mediadelivery.net/embed/360729/${lesson?.videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Difficulty Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {(['easy', 'medium', 'challenging'] as const).map((level) => (
          <button
            key={level}
            onClick={() => {
              setCurrentDifficulty(level);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className={`px-4 py-2 capitalize font-semibold border-b-2 transition-colors ${
              currentDifficulty === level
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {level} (10 Q)
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all"
          style={{ width: `${((currentQuestion + 1) / 10) * 100}%` }}
        />
      </div>

      {/* Question */}
      <Card className="p-6 mb-6">
        <h3 className="font-bold mb-4">Question {currentQuestion + 1}/10</h3>
        <p className="mb-6 text-lg">{currentExercise.question}</p>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {JSON.parse(currentExercise.options || "[]").map((option: string, idx: number) => (
            <label
              key={idx}
              className={`flex items-center p-3 border-2 rounded cursor-pointer transition-colors ${
                answers[currentExercise.id] === idx
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="answer"
                value={idx}
                checked={answers[currentExercise.id] === idx}
                onChange={() => setAnswers({ ...answers, [currentExercise.id]: idx })}
                className="mr-3"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>

        {/* Solution Video */}
        {currentExercise.solutionVideoId && (
          <details className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <summary className="cursor-pointer font-semibold text-yellow-800">
              💡 View Solution Video
            </summary>
            <div className="mt-4 aspect-video bg-black rounded overflow-hidden">
              <iframe
                src={`https://iframe.mediadelivery.net/embed/360729/${currentExercise.solutionVideoId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </details>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            ← Previous
          </Button>
          <Button
            onClick={() => setCurrentQuestion(Math.min(9, currentQuestion + 1))}
            disabled={currentQuestion === 9}
            variant="outline"
          >
            Next →
          </Button>
        </div>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleSubmitLevel}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
        disabled={submitMutation.isPending}
      >
        {submitMutation.isPending ? 'Submitting...' : `Submit ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)} Level`}
      </Button>
    </div>
  );
}
