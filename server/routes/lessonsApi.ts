import { Router } from "express";
const router = Router();

// Mock curriculum data
const mockLessons = [
  {
    id: 1,
    title: "Introduction to Algebra",
    description: "Learn the basics of algebraic expressions and equations.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // Placeholder video
    order: 1,
  },
  {
    id: 2,
    title: "Geometry Fundamentals",
    description: "Explore shapes, sizes, and the properties of space.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    order: 2,
  },
  {
    id: 23,
    title: "Advanced Calculus",
    description: "Deep dive into limits, derivatives, and integrals.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    order: 23,
  }
];

const mockExercises = {
  1: [
    { id: 101, lessonId: 1, difficulty: "easy", question: "What is 2x + 5 = 15?", options: JSON.stringify(["x=5", "x=10", "x=2", "x=7"]), correctAnswer: "x=5", solutionVideoId: "dQw4w9WgXcQ", orderIndex: 1 },
    { id: 102, lessonId: 1, difficulty: "easy", question: "Simplify 3(x + 4)", options: JSON.stringify(["3x+12", "3x+4", "x+12", "3x+7"]), correctAnswer: "3x+12", solutionVideoId: "dQw4w9WgXcQ", orderIndex: 2 },
  ],
  2: [
    { id: 201, lessonId: 2, difficulty: "easy", question: "What is the area of a circle with radius 5?", options: JSON.stringify(["25π", "10π", "5π", "50π"]), correctAnswer: "25π", solutionVideoId: "dQw4w9WgXcQ", orderIndex: 1 },
  ],
  23: [
    { id: 2301, lessonId: 23, difficulty: "easy", question: "What is the derivative of x^2?", options: JSON.stringify(["2x", "x", "2", "x^2"]), correctAnswer: "2x", solutionVideoId: "dQw4w9WgXcQ", orderIndex: 1 },
  ]
};

// GET /api/lessons/direct
router.get("/", (req, res) => {
  res.json(mockLessons);
});

// GET /api/lessons/direct/:id
router.get("/:id", (req, res) => {
  const lesson = mockLessons.find(l => l.id === parseInt(req.params.id));
  if (lesson) {
    res.json(lesson);
  } else {
    res.status(404).json({ message: "Lesson not found" });
  }
});

// GET /api/lessons/direct/:id/exercises
router.get("/:id/exercises", (req, res) => {
  const exercises = mockExercises[parseInt(req.params.id) as keyof typeof mockExercises] || [];
  res.json(exercises);
});

export default router;
