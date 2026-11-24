import { getDb } from "../db.js";
export const replacements = [
  {
    "lessonOrder": 17,
    "title": "HCF and LCM of Large Numbers",
    "source": "L17-M10",
    "difficulty": "medium",
    "order": 10,
    "text": "Find the LCM of 90 and 300.",
    "answer": "900",
    "options": [
      "400",
      "200",
      "700",
      "800",
      "900"
    ],
    "old": "ab4a5d3c-a50e-45e3-8f40-bca59a18dc24",
    "next": "0bbf7539-d611-4cd1-a249-9701b23cdd40"
  }
];

export function planVideos(rows: any[]) {
  if (rows.length !== replacements.length) throw new Error("Expected exactly one target question.");
  return replacements.map(r => {
    const matches = rows.filter(q => q.source_id === r.source && q.lesson_order === r.lessonOrder);
    if (matches.length !== 1) throw new Error("Question identity differs.");
    const q = matches[0];
    const options = JSON.parse(q.options_json);
    if (q.title !== r.title || q.bunny_library_id !== 360729 || q.difficulty !== r.difficulty || q.order_index !== r.order ||
        q.question_text !== r.text || q.correct_answer !== r.answer || !Array.isArray(options) ||
        JSON.stringify([...options].sort()) !== JSON.stringify([...r.options].sort()) ||
        ![r.old, r.next].includes(q.solution_video_id)) throw new Error("Question or video differs from reviewed baseline.");
    return { replacement: r, id: q.id, lessonId: q.lesson_id, pending: q.solution_video_id !== r.next };
  });
}
export async function repairLargeNumberMediumVideo(apply = false) {
  if (process.env.APP_BASE_URL?.trim() !== "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL) throw new Error("Staging configuration required.");
  const db = await getDb(), connection = await db.$client.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const select = "SELECT q.id, q.lesson_id, q.source_id, q.difficulty, q.order_index, q.question_text, q.options_json, q.correct_answer, q.solution_video_id, l.order_index AS lesson_order, l.title, l.bunny_library_id FROM lesson_questions q JOIN lessons l ON l.id = q.lesson_id WHERE l.course_id = 2 AND q.source_id IN (" + replacements.map(() => "?").join(",") + ") ORDER BY l.id, q.id FOR UPDATE";
    const values = replacements.map(r => r.source);
    const [rows] = await connection.query(select, values);
    const plan = planVideos(rows), pending = plan.filter(p => p.pending);
    for (const p of plan) console.log(p.replacement.source + ": " + p.replacement.next + (p.pending ? " | replacement pending" : " | already linked"));
    if (apply) {
      for (const p of pending) {
        const r = p.replacement;
        const [result] = await connection.query("UPDATE lesson_questions SET solution_video_id = ? WHERE id = ? AND lesson_id = ? AND source_id = ? AND solution_video_id = ?", [r.next, p.id, p.lessonId, r.source, r.old]);
        if (result.affectedRows !== 1) throw new Error("Unexpected update count.");
      }
      const [updated] = await connection.query(select, values);
      if (planVideos(updated).some(p => p.pending)) throw new Error("Verification failed.");
      await connection.commit(); committed = true;
      console.log("APPLIED: " + pending.length + " video link replacements; the target link verified.");
    } else console.log("DRY RUN: " + pending.length + " video link replacements pending. No records changed. Run with --apply to save.");
    console.log("Questions, answers, options, attempts, scores and approvals were not changed. Existing attempts retain their video IDs; use new attempts to check replacement videos. Playback and video contents require browser review.");
  } finally {
    try { if (!committed) await connection.rollback(); } finally { connection.release(); }
  }
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("/repairLargeNumberMediumVideo.js")) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.length === 1 && args[0] !== "--apply") {
    console.error("Usage: repairLargeNumberMediumVideo.js [--apply]"); process.exit(1);
  }
  repairLargeNumberMediumVideo(args[0] === "--apply").then(() => process.exit(0)).catch(() => {
    console.error("Repair stopped. Staging configuration or reviewed content checks failed; uncommitted changes rolled back."); process.exit(1);
  });
}
