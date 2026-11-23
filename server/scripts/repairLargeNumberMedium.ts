import { getDb } from "../db.js";

type Content = { text: string; options: string[]; answer: string };
type Repair = { sourceId: string; orderIndex: number; videoId: string; before: Content; after: Content };
export const repairs: Repair[] = [
  {
    "sourceId": "L17-M1",
    "orderIndex": 1,
    "videoId": "fb951bd4-f27a-4c54-8dbe-7455a261c591",
    "before": {
      "text": "Find the HCF of 90 and 300.",
      "options": [
        "54",
        "35",
        "40",
        "45",
        "30"
      ],
      "answer": "30"
    },
    "after": {
      "text": "Find the HCF of 300 and 1050.",
      "options": [
        "154",
        "135",
        "140",
        "145",
        "150"
      ],
      "answer": "150"
    }
  },
  {
    "sourceId": "L17-M3",
    "orderIndex": 3,
    "videoId": "806a947d-81c6-440a-9221-029af00fa04b",
    "before": {
      "text": "Find the HCF of 200 and 300.",
      "options": [
        "120",
        "90",
        "80",
        "110",
        "100"
      ],
      "answer": "100"
    },
    "after": {
      "text": "Find the HCF of 324 and 1890.",
      "options": [
        "56",
        "35",
        "40",
        "45",
        "54"
      ],
      "answer": "54"
    }
  },
  {
    "sourceId": "L17-M4",
    "orderIndex": 4,
    "videoId": "a4106dae-3249-45d9-b56c-cf526c97675f",
    "before": {
      "text": "Find the LCM of 250 and 320.",
      "options": [
        "4890",
        "5000",
        "5680",
        "5640",
        "8000"
      ],
      "answer": "8000"
    },
    "after": {
      "text": "Find the HCF of 1260 and 1050.",
      "options": [
        "290",
        "200",
        "380",
        "240",
        "210"
      ],
      "answer": "210"
    }
  },
  {
    "sourceId": "L17-M5",
    "orderIndex": 5,
    "videoId": "619130f9-bdf9-48a6-a79a-2a07d0d9b5e0",
    "before": {
      "text": "Find the HCF of 250 and 320.",
      "options": [
        "18",
        "15",
        "17",
        "13",
        "10"
      ],
      "answer": "10"
    },
    "after": {
      "text": "Find the HCF of 1250 and 2310.",
      "options": [
        "18",
        "15",
        "17",
        "13",
        "10"
      ],
      "answer": "10"
    }
  },
  {
    "sourceId": "L17-M8",
    "orderIndex": 8,
    "videoId": "f17df0fd-98c4-47a8-832e-d4a3e52fb541",
    "before": {
      "text": "Find the LCM of 450 and 560.",
      "options": [
        "25290",
        "24100",
        "25260",
        "25280",
        "25200"
      ],
      "answer": "25200"
    },
    "after": {
      "text": "Find the LCM of 144 and 324.",
      "options": [
        "1290",
        "1100",
        "1260",
        "1280",
        "1296"
      ],
      "answer": "1296"
    }
  },
  {
    "sourceId": "L17-M9",
    "orderIndex": 9,
    "videoId": "f33f2bf0-40c7-4a99-8ec2-ffad095157ae",
    "before": {
      "text": "Find the HCF of 450 and 560.",
      "options": [
        "60",
        "20",
        "30",
        "50",
        "10"
      ],
      "answer": "10"
    },
    "after": {
      "text": "Find the LCM of 80 and 120.",
      "options": [
        "160",
        "320",
        "230",
        "150",
        "240"
      ],
      "answer": "240"
    }
  },
  {
    "sourceId": "L17-M10",
    "orderIndex": 10,
    "videoId": "0bbf7539-d611-4cd1-a249-9701b23cdd40",
    "before": {
      "text": "Find the LCM of 300 and 1050.",
      "options": [
        "2400",
        "2200",
        "2700",
        "2800",
        "2100"
      ],
      "answer": "2100"
    },
    "after": {
      "text": "Find the LCM of 90 and 300.",
      "options": [
        "400",
        "200",
        "700",
        "800",
        "900"
      ],
      "answer": "900"
    }
  }
];

const sameOptions = (a: unknown, b: string[]) => Array.isArray(a) && a.every(x => typeof x === "string") &&
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export function planRepair(rows: any[]) {
  if (rows.length !== repairs.length) throw new Error("Expected exactly seven target questions.");
  return repairs.map(repair => {
    const matches = rows.filter(row => row.source_id === repair.sourceId);
    if (matches.length !== 1) throw new Error("Missing or repeated question identity.");
    const row = matches[0];
    if (row.difficulty !== "medium" || row.order_index !== repair.orderIndex || row.solution_video_id !== repair.videoId || row.diagram != null)
      throw new Error("Question position, diagram or video differs from the reviewed baseline.");
    let options: unknown;
    try { options = JSON.parse(row.options_json); } catch { throw new Error("Invalid existing answer options."); }
    const matchesContent = (c: Content) => row.question_text === c.text && row.correct_answer === c.answer && sameOptions(options, c.options);
    if (matchesContent(repair.after)) return { repair, id: row.id, pending: false };
    if (!matchesContent(repair.before)) throw new Error("Question content differs from both reviewed versions.");
    return { repair, id: row.id, pending: true };
  });
}

export async function repairLargeNumberMedium(apply = false) {
  if (process.env.APP_BASE_URL?.trim() !== "https://schrool-platform-staging-3583c1139100.herokuapp.com" ||
      !process.env.DATABASE_URL || process.env.DATABASE_URL !== process.env.JAWSDB_URL) throw new Error("Staging configuration required.");
  const db = await getDb(), connection = await db.$client.getConnection();
  let committed = false;
  try {
    await connection.beginTransaction();
    const [lessons] = await connection.query("SELECT id, title, bunny_library_id FROM lessons WHERE course_id = 2 AND order_index = 17 FOR UPDATE");
    if (lessons.length !== 1 || lessons[0].title !== "HCF and LCM of Large Numbers" || lessons[0].bunny_library_id !== 360729)
      throw new Error("Expected Year 5/6 lesson 17 identity.");
    const lessonId = lessons[0].id, sources = repairs.map(r => r.sourceId);
    const select = "SELECT id, source_id, difficulty, order_index, question_text, options_json, correct_answer, solution_video_id, diagram FROM lesson_questions WHERE lesson_id = ? AND source_id IN (" + sources.map(() => "?").join(",") + ") FOR UPDATE";
    const [rows] = await connection.query(select, [lessonId, ...sources]);
    const plan = planRepair(rows), pending = plan.filter(p => p.pending);
    for (const { repair, pending } of plan) console.log(repair.sourceId + ": " + repair.after.text + " Answer: " + repair.after.answer + (pending ? " | correction pending" : " | already corrected"));
    if (apply) {
      for (const { repair, id } of pending) {
        const [result] = await connection.query("UPDATE lesson_questions SET question_text = ?, options_json = ?, correct_answer = ? WHERE id = ? AND lesson_id = ? AND source_id = ? AND difficulty = ?",
          [repair.after.text, JSON.stringify(repair.after.options), repair.after.answer, id, lessonId, repair.sourceId, "medium"]);
        if (result.affectedRows !== 1) throw new Error("Unexpected update count; rolling back.");
      }
      const [updated] = await connection.query(select, [lessonId, ...sources]);
      if (planRepair(updated).some(p => p.pending)) throw new Error("Post-update verification failed.");
      await connection.commit(); committed = true;
      console.log("APPLIED: " + pending.length + " Medium question corrections; all seven verified.");
    } else console.log("DRY RUN: " + pending.length + " corrections pending. No records changed. Run with --apply to save.");
    console.log("Video IDs, Easy and Challenging questions, attempts, scores, approvals and customer records were not changed. Existing attempts retain their saved questions; start a new Medium attempt after the repair.");
  } finally {
    try { if (!committed) await connection.rollback(); } finally { connection.release(); }
  }
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("/repairLargeNumberMedium.js")) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.length === 1 && args[0] !== "--apply") {
    console.error("Usage: repairLargeNumberMedium.js [--apply]"); process.exit(1);
  }
  repairLargeNumberMedium(args[0] === "--apply").then(() => process.exit(0)).catch(() => {
    console.error("Repair stopped. Staging access or reviewed content checks failed. Uncommitted changes were rolled back.");
    process.exit(1);
  });
}
