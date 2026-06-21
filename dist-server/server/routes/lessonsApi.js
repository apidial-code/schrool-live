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
        { id: 101, question: "What is 2x + 5 = 15?", options: ["x=5", "x=10", "x=2", "x=7"], answer: "x=5", difficulty: "easy" },
        { id: 102, question: "Simplify 3(x + 4)", options: ["3x+12", "3x+4", "x+12", "3x+7"], answer: "3x+12", difficulty: "medium" },
    ],
    2: [
        { id: 201, question: "What is the area of a circle with radius 5?", options: ["25π", "10π", "5π", "50π"], answer: "25π", difficulty: "easy" },
    ],
    23: [
        { id: 2301, question: "What is the derivative of x^2?", options: ["2x", "x", "2", "x^2"], answer: "2x", difficulty: "easy" },
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
    }
    else {
        res.status(404).json({ message: "Lesson not found" });
    }
});
// GET /api/lessons/direct/:id/exercises
router.get("/:id/exercises", (req, res) => {
    const exercises = mockExercises[parseInt(req.params.id)] || [];
    res.json(exercises);
});
export default router;
