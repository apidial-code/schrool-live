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
export declare function LessonPlayer({ lessonId, lessonTitle, lessonDescription, introVideoUrl, questions, onComplete, }: LessonPlayerProps): import("react/jsx-runtime").JSX.Element;
export {};
