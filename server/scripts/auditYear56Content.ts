import { getDb } from "../db.js";

type Lesson = { id: number; title: string | null; order_index: number | null; bunny_library_id: number | null; bunny_video_id: string | null };
type Question = { id: number; lesson_id: number; source_id: string; difficulty: string; order_index: number; question_text: string; options_json: string; correct_answer: string; solution_video_id: string | null };
const levels = ["easy", "medium", "challenging"];
const videoId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Pure structural checks. These cannot establish mathematical correctness or video playback.
export function contentInventory(lessons: Lesson[], questions: Question[]) {
  const issues: string[] = [], reviews: string[] = [], lines: string[] = [];
  let explainers = 0, solutions = 0;
  const usedVideos = new Map<string, string[]>();
  const useVideo = (key: string, label: string) => usedVideos.set(key, [...(usedVideos.get(key) ?? []), label]);
  if (lessons.length !== 23) issues.push(`Course has ${lessons.length} lessons; expected 23.`);
  const positions = lessons.map(l => l.order_index).sort((a, b) => Number(a) - Number(b));
  if (positions.length !== 23 || positions.some((n, i) => n !== i + 1)) issues.push("Lesson positions must be exactly 1 through 23.");
  if (questions.length !== 690) issues.push(`Course has ${questions.length} questions; expected 690.`);
  const lessonIds = new Set(lessons.map(l => l.id));
  for (const q of questions) if (!lessonIds.has(q.lesson_id)) issues.push(`Question #${q.id} has an unexpected lesson.`);
  for (const lesson of lessons) {
    const label = `Lesson ${lesson.order_index ?? "?"} (#${lesson.id})`;
    if (!lesson.title?.trim()) issues.push(`${label}: missing title.`);
    const libraryOK = Number.isInteger(lesson.bunny_library_id) && Number(lesson.bunny_library_id) > 0;
    if (!libraryOK) issues.push(`${label}: missing or invalid Bunny library ID.`);
    if (videoId.test(lesson.bunny_video_id ?? "")) {
      explainers++;
      if (libraryOK) useVideo(`${lesson.bunny_library_id}/${lesson.bunny_video_id!.toLowerCase()}`, `${label} explainer`);
    } else issues.push(`${label}: missing or malformed explainer video ID.`);
    const rows = questions.filter(q => q.lesson_id === lesson.id);
    const counts = levels.map(level => rows.filter(q => q.difficulty === level).length);
    const validSolutions = rows.filter(q => videoId.test(q.solution_video_id ?? "")).length;
    solutions += validSolutions;
    lines.push(`${label}: ${lesson.title ?? "(untitled)"} | E/M/C ${counts.join("/")} | explainer ${libraryOK && videoId.test(lesson.bunny_video_id ?? "") ? "recorded" : "CHECK"} | solution IDs ${validSolutions}/${rows.length}`);
    for (const level of levels) {
      const set = rows.filter(q => q.difficulty === level).sort((a, b) => a.order_index - b.order_index);
      if (set.length !== 10 || set.some((q, i) => q.order_index !== i + 1)) issues.push(`${label} ${level}: expected exactly 10 questions in positions 1 through 10.`);
    }
    const sources = new Set<string>();
    for (const q of rows) {
      const where = `${label} ${q.difficulty} Q${q.order_index} (#${q.id})`;
      if (!levels.includes(q.difficulty)) issues.push(`${where}: unexpected difficulty.`);
      if (!q.source_id?.trim() || sources.has(q.source_id)) issues.push(`${where}: missing or repeated source ID.`);
      sources.add(q.source_id);
      if (!q.question_text?.trim()) issues.push(`${where}: empty question text.`);
      let options: unknown;
      try { options = JSON.parse(q.options_json); } catch { issues.push(`${where}: invalid options JSON.`); }
      if (!Array.isArray(options) || options.length < 2 || options.length > 10 || options.some(o => typeof o !== "string" || !o.trim())) {
        issues.push(`${where}: invalid or empty answer options.`);
      } else {
        if (options.length !== 5) reviews.push(`${where}: ${options.length} options; expected five for this course.`);
        if (!q.correct_answer?.trim() || !options.includes(q.correct_answer)) issues.push(`${where}: recorded correct answer is missing from the options.`);
        const normalized = options.map((o: string) => o.trim().replace(/\s+/g, " "));
        if (new Set(normalized).size !== normalized.length) reviews.push(`${where}: repeated answer option text.`);
      }
      if (!videoId.test(q.solution_video_id ?? "")) issues.push(`${where}: missing or malformed worked-solution video ID.`);
      else if (libraryOK) useVideo(`${lesson.bunny_library_id}/${q.solution_video_id!.toLowerCase()}`, where);
    }
  }
  for (const labels of usedVideos.values()) if (labels.length > 1) reviews.push(`Shared video reference, check intended mapping: ${labels.join("; ")}.`);
  return { lines, issues, reviews, explainers, solutions };
}

export async function auditYear56Content() {
  if (process.env.APP_BASE_URL?.trim() !== "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL) throw new Error("Staging configuration required.");
  const db = await getDb();
  const connection = await db.$client.getConnection();
  try {
    await connection.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await connection.query("START TRANSACTION WITH CONSISTENT SNAPSHOT, READ ONLY");
    const [courses] = await connection.query("SELECT id, title FROM courses WHERE id = 2");
    if (courses.length !== 1) throw new Error("Expected Year 5/6 course #2 is missing.");
    const [lessons] = await connection.query("SELECT id, title, order_index, bunny_library_id, bunny_video_id FROM lessons WHERE course_id = 2 ORDER BY order_index, id");
    const [questions] = await connection.query("SELECT q.id, q.lesson_id, q.source_id, q.difficulty, q.order_index, q.question_text, q.options_json, q.correct_answer, q.solution_video_id FROM lesson_questions q INNER JOIN lessons l ON l.id = q.lesson_id WHERE l.course_id = 2 ORDER BY l.order_index, q.difficulty, q.order_index, q.id");
    const report = contentInventory(lessons, questions);
    console.log(`STAGING YEAR 5/6 STRUCTURAL INVENTORY | ${new Date().toISOString()} | Course #2: ${courses[0].title}`);
    for (const line of report.lines) console.log(line);
    console.log(`TOTAL: ${lessons.length}/23 lessons; ${questions.length}/690 questions; ${report.explainers}/23 syntactically valid explainer IDs; ${report.solutions}/690 syntactically valid solution IDs.`);
    console.log(`STRUCTURAL ISSUES: ${report.issues.length}`);
    for (const issue of report.issues) console.log(`CHECK: ${issue}`);
    console.log(`MANUAL REVIEW FLAGS: ${report.reviews.length}`);
    for (const review of report.reviews) console.log(`REVIEW: ${review}`);
    console.log("Scope: database records only. Video availability, correct video-to-question mapping, math, diagrams, difficulty and written lesson content still require separate review. No customer or course records changed.");
    return report;
  } finally {
    try { await connection.rollback(); } finally { connection.release(); }
  }
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("/auditYear56Content.js")) {
  if (process.argv.length !== 2) { console.error("No arguments are accepted."); process.exit(1); }
  auditYear56Content().then(() => process.exit(0)).catch(() => {
    console.error("Audit could not complete. Check staging configuration, database access and deployed schema. No content changes were requested.");
    process.exit(1);
  });
}
