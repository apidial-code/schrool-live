import { Router } from "express";
import mysql from "mysql2/promise";

const router = Router();

// Create a connection pool using the DATABASE_URL env var
let pool: mysql.Pool | null = null;
function db() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    pool = mysql.createPool({
      uri: url,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

// GET /api/lessons/direct
router.get("/", async (req, res) => {
  try {
    const [rows] = await db().query(
      `SELECT id, title, description, videoId, thumbnailUrl, duration, orderIndex, category
       FROM lessons ORDER BY orderIndex ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("[LessonsAPI] Error fetching lessons:", err);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
});

// GET /api/lessons/direct/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid lesson ID" });
    const [rows] = await db().query(
      `SELECT id, title, description, videoId, thumbnailUrl, duration, orderIndex, category
       FROM lessons WHERE id = ? LIMIT 1`,
      [id]
    ) as any[];
    if (!(rows as any[]).length) return res.status(404).json({ message: "Lesson not found" });
    res.json((rows as any[])[0]);
  } catch (err) {
    console.error("[LessonsAPI] Error fetching lesson:", err);
    res.status(500).json({ message: "Failed to fetch lesson" });
  }
});

// GET /api/lessons/direct/:id/exercises?difficulty=easy
router.get("/:id/exercises", async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id);
    if (isNaN(lessonId)) return res.status(400).json({ message: "Invalid lesson ID" });
    const difficulty = req.query.difficulty as string | undefined;

    let query = `SELECT id, lessonId, question, correctAnswer, solutionVideoId, orderIndex, difficulty, options, imageUrl
                 FROM exercises WHERE lessonId = ?`;
    const params: any[] = [lessonId];

    if (difficulty && ["easy", "medium", "challenging"].includes(difficulty)) {
      query += ` AND difficulty = ?`;
      params.push(difficulty);
    }
    query += ` ORDER BY orderIndex ASC`;

    const [rows] = await db().query(query, params) as any[];

    // Parse options JSON if stored as string
    const exercises = (rows as any[]).map((ex: any) => ({
      ...ex,
      options: typeof ex.options === "string"
        ? (() => { try { return JSON.parse(ex.options); } catch { return ex.options; } })()
        : ex.options,
    }));

    res.json(exercises);
  } catch (err) {
    console.error("[LessonsAPI] Error fetching exercises:", err);
    res.status(500).json({ message: "Failed to fetch exercises" });
  }
});

export default router;
