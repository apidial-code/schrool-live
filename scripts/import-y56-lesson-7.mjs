import { readFile } from "node:fs/promises";
import { z } from "zod";

const modes = ["--check", "--apply"];
const [mode, ...extra] = process.argv.slice(2);
if (!modes.includes(mode) || extra.length) {
  console.error("Usage: node scripts/import-y56-lesson-7.mjs --check|--apply");
  process.exit(1);
}

const uuid = z.string().uuid();
const levels = ["easy", "medium", "challenging"];
const questionSchema = z.object({
  sourceId: z.string(),
  difficulty: z.enum(levels),
  orderIndex: z.number().int().min(1).max(10),
  questionText: z.string().min(1),
  diagram: z.null(),
  options: z.array(z.string().min(1)).length(5),
  correctAnswer: z.string().min(1),
  solutionVideoId: uuid,
});
const lessonSchema = z.object({
  formatVersion: z.literal(1),
  sourceLessonNumber: z.literal(7),
  title: z.literal("What is a Decimal?"),
  bunnyLibraryId: z.number().int().positive(),
  bunnyVideoId: uuid,
  questions: z.array(questionSchema).length(30),
});

async function run() {
  const file = new URL("../server/y56-lesson-7.json", import.meta.url);
  const lesson = lessonSchema.parse(JSON.parse(await readFile(file, "utf8")));
  const sourceIds = new Set();
  const videoIds = new Set([lesson.bunnyVideoId]);
  for (const q of lesson.questions) {
    const levelLetter = q.difficulty[0].toUpperCase();
    if (q.sourceId !== `L7-${levelLetter}${q.orderIndex}` ||
        sourceIds.has(q.sourceId) || videoIds.has(q.solutionVideoId) ||
        new Set(q.options).size !== q.options.length || !q.options.includes(q.correctAnswer)) {
      throw new Error("Invalid or duplicate question or video mapping.");
    }
    sourceIds.add(q.sourceId);
    videoIds.add(q.solutionVideoId);
  }
  console.log("Validated What is a Decimal?: 30 questions, 1 explainer, 30 solution mappings.");
  if (mode === "--check") return;

  const stagingOrigin = "https://schrool-platform-staging-3583c1139100.herokuapp.com";
  if (process.env.APP_BASE_URL?.trim() !== stagingOrigin ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL) {
    throw new Error("Staging configuration check failed.");
  }

  const { eq } = await import("drizzle-orm");
  const { courses, lessons, lessonQuestions } = await import("../dist-server/drizzle/schema.js");
  const { getDb } = await import("../dist-server/server/db.js");
  const db = await getDb();
  const result = await db.transaction(async tx => {
    const [course] = await tx.select().from(courses)
      .where(eq(courses.id, 2)).for("update");
    if (course?.title !== "Math I Year 5/6") {
      throw new Error("Expected staging course was not found.");
    }
    const inventory = await tx.select().from(lessons).where(eq(lessons.courseId, course.id));
    const previousLessons = inventory.filter(row => row.title?.trim().toLowerCase() === "combination of all principles bodmas");
    if (previousLessons.length !== 1 || !Number.isInteger(previousLessons[0].orderIndex)) {
      throw new Error("Expected staging Lesson 6 was not found.");
    }
    const orderIndex = previousLessons[0].orderIndex + 1;
    const sameTitle = inventory.filter(row =>
      row.title?.trim().toLowerCase() === lesson.title.toLowerCase());
    if (sameTitle.length > 1 || inventory.some(row =>
      row.orderIndex === orderIndex && row.id !== sameTitle[0]?.id &&
      row.title?.trim().toLowerCase() !== "access verification")) {
      throw new Error("The Lesson 7 position or title conflicts with an existing lesson.");
    }

    let lessonId;
    if (sameTitle.length) {
      const existing = sameTitle[0];
      if (existing.orderIndex !== orderIndex || existing.bunnyLibraryId !== lesson.bunnyLibraryId ||
          existing.bunnyVideoId !== lesson.bunnyVideoId) {
        throw new Error("Existing What is a Decimal? lesson differs from the import.");
      }
      lessonId = existing.id;
    } else {
      [{ id: lessonId }] = await tx.insert(lessons).values({
        courseId: course.id, title: lesson.title, orderIndex,
        bunnyLibraryId: lesson.bunnyLibraryId, bunnyVideoId: lesson.bunnyVideoId,
      }).$returningId();
    }

    const questions = lesson.questions.map(({ options, ...question }) => ({
      ...question, lessonId, optionsJson: JSON.stringify(options),
    }));
    const saved = await tx.select().from(lessonQuestions).where(eq(lessonQuestions.lessonId, lessonId));
    if (sameTitle.length) {
      const savedBySource = new Map(saved.map(question => [question.sourceId, question]));
      const matches = (existing, expected) => existing &&
        Object.entries(expected).every(([field, value]) => existing[field] === value);
      if (saved.length === questions.length &&
          questions.every(question => matches(savedBySource.get(question.sourceId), question))) {
        return "already imported";
      }

      throw new Error("Existing Lesson 7 questions differ from this import.");
    }
    await tx.insert(lessonQuestions).values(questions);
    return "imported";
  });
  console.log(`What is a Decimal? ${result} in the Year 5/6 staging course.`);
}

run().then(() => process.exit(0)).catch(error => {
  console.error(error.message);
  process.exit(1);
});
