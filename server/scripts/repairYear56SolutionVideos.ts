import { getDb } from "../db.js";
export const replacements = [
  {
    "lessonOrder": 7,
    "title": "What is a Decimal?",
    "source": "L7-E2",
    "difficulty": "easy",
    "order": 2,
    "text": "What is 7 hundreds, 8 tens, and 8 units?",
    "answer": "788",
    "options": [
      "1788",
      "887",
      "878",
      "1878",
      "788"
    ],
    "old": "4ed39378-ca0c-45a9-bd3c-ca829a219dc9",
    "next": "4ed39378-ca0c-45a9-bd3c-ca829a219dc9"
  },
  {
    "lessonOrder": 7,
    "title": "What is a Decimal?",
    "source": "L7-E9",
    "difficulty": "easy",
    "order": 9,
    "text": "What is 2 thousands, 2 hundreds, 9 tens and 5 units?",
    "answer": "2295",
    "options": [
      "2595",
      "2095",
      "2205",
      "2925",
      "2295"
    ],
    "old": "ef12b19d-c7ed-4773-97cf-f18d14e85106",
    "next": "ef12b19d-c7ed-4773-97cf-f18d14e85106"
  },
  {
    "lessonOrder": 7,
    "title": "What is a Decimal?",
    "source": "L7-M10",
    "difficulty": "medium",
    "order": 10,
    "text": "Convert to decimal: \\frac{4}{10} + \\frac{9}{100} + \\frac{3}{1000}",
    "answer": "0.493",
    "options": [
      "0.439",
      "0.943",
      "0.349",
      "0.394",
      "0.493"
    ],
    "old": "b82521ac-6d5f-40c3-ba04-9078c8233992",
    "next": "b82521ac-6d5f-40c3-ba04-9078c8233992"
  },
  {
    "lessonOrder": 10,
    "title": "Subtraction of Decimals",
    "source": "L10-M4",
    "difficulty": "medium",
    "order": 4,
    "text": "35.8 less than 64.6",
    "answer": "28.8",
    "options": [
      "28.3",
      "28.8",
      "2.888",
      "0.028",
      "0.0028"
    ],
    "old": "1ebcdc63-c812-4cc1-8da1-eab1bdce8542",
    "next": "1ebcdc63-c812-4cc1-8da1-eab1bdce8542"
  },
  {
    "lessonOrder": 17,
    "title": "HCF and LCM of Large Numbers",
    "source": "L17-E4",
    "difficulty": "easy",
    "order": 4,
    "text": "Find the LCM of 24 and 300.",
    "answer": "600",
    "options": [
      "900",
      "500",
      "800",
      "700",
      "600"
    ],
    "old": "112f9793-06ee-45ba-af8f-e1b0d5e538f4",
    "next": "112f9793-06ee-45ba-af8f-e1b0d5e538f4"
  },
  {
    "lessonOrder": 17,
    "title": "HCF and LCM of Large Numbers",
    "source": "L17-E5",
    "difficulty": "easy",
    "order": 5,
    "text": "Find the HCF of 36 and 84.",
    "answer": "12",
    "options": [
      "19",
      "14",
      "15",
      "17",
      "12"
    ],
    "old": "2573bd78-3943-48d0-87bd-992f72328397",
    "next": "d177f9b2-b739-4737-812b-f385939ae129"
  },
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
    "old": "0bbf7539-d611-4cd1-a249-9701b23cdd40",
    "next": "ab4a5d3c-a50e-45e3-8f40-bca59a18dc24"
  },
  {
    "lessonOrder": 18,
    "title": "Square and Cube Roots",
    "source": "L18-C10",
    "difficulty": "challenging",
    "order": 10,
    "text": "Find ∛(8472 ÷ 48) using a calculator. Give your answer to one decimal place.",
    "answer": "5.6",
    "options": [
      "6.1",
      "8.7",
      "9.3",
      "5.8",
      "5.6"
    ],
    "old": "4f61c223-52d3-4821-b983-ae368932f25a",
    "next": "4f61c223-52d3-4821-b983-ae368932f25a"
  },
  {
    "lessonOrder": 23,
    "title": "Multiplication by 2 Digits",
    "source": "L23-M5",
    "difficulty": "medium",
    "order": 5,
    "text": "Multiply 766 by 83.",
    "answer": "63578",
    "options": [
      "63758",
      "63587",
      "63785",
      "63578",
      "36758"
    ],
    "old": "30bf0de1-2c09-4917-96e8-876544c1061c",
    "next": "3bec0574-73ff-4e9f-878a-327ce399b6f4"
  },
  {
    "lessonOrder": 23,
    "title": "Multiplication by 2 Digits",
    "source": "L23-C7",
    "difficulty": "challenging",
    "order": 7,
    "text": "Multiply 8627 by 89.",
    "answer": "767803",
    "options": [
      "767308",
      "767803",
      "767083",
      "776308",
      "773608"
    ],
    "old": "296c32be-5f46-4505-89e9-338de4ee2adf",
    "next": "8a1d2b6d-4850-42ed-b6aa-65783e1fd62b"
  }
];

export function planVideos(rows: any[]) {
  if (rows.length !== replacements.length) throw new Error("Expected exactly ten target questions.");
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
export async function repairYear56SolutionVideos(apply = false) {
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
      console.log("APPLIED: " + pending.length + " video link replacements; all ten verified.");
    } else console.log("DRY RUN: " + pending.length + " video link replacements pending. No records changed. Run with --apply to save.");
    console.log("Questions, answers, options, attempts, scores and approvals were not changed. Existing attempts retain their video IDs; use new attempts to check replacement videos. Playback and video contents require browser review.");
  } finally {
    try { if (!committed) await connection.rollback(); } finally { connection.release(); }
  }
}
if (process.argv[1]?.replace(/\\/g, "/").endsWith("/repairYear56SolutionVideos.js")) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.length === 1 && args[0] !== "--apply") {
    console.error("Usage: repairYear56SolutionVideos.js [--apply]"); process.exit(1);
  }
  repairYear56SolutionVideos(args[0] === "--apply").then(() => process.exit(0)).catch(() => {
    console.error("Repair stopped. Staging configuration or reviewed content checks failed; uncommitted changes rolled back."); process.exit(1);
  });
}
