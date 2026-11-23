import { getDb } from "../db.js";

type Content = { text: string; options: string[]; answer: string };
type Repair = { sourceId: string; orderIndex: number; videoId: string; before: Content; after: Content };
export const repairs: Repair[] = [
  {
    "sourceId": "L17-C1",
    "orderIndex": 1,
    "videoId": "4b270f93-290e-498e-8d6b-56983b99b711",
    "before": {
      "text": "Find the HCF of 300 and 1050.",
      "options": [
        "180",
        "140",
        "170",
        "130",
        "150"
      ],
      "answer": "150"
    },
    "after": {
      "text": "Find the LCM of 200 and 300.",
      "options": [
        "180",
        "640",
        "370",
        "530",
        "600"
      ],
      "answer": "600"
    }
  },
  {
    "sourceId": "L17-C2",
    "orderIndex": 2,
    "videoId": "0de02aa6-196d-4a9a-aded-f0b2723f0d3a",
    "before": {
      "text": "Find the LCM of 1250 and 1050.",
      "options": [
        "26900",
        "26600",
        "26500",
        "26800",
        "26250"
      ],
      "answer": "26250"
    },
    "after": {
      "text": "Find the LCM of 1250 and 1050.",
      "options": [
        "26900",
        "26600",
        "26500",
        "26800",
        "26250"
      ],
      "answer": "26250"
    }
  },
  {
    "sourceId": "L17-C3",
    "orderIndex": 3,
    "videoId": "9c5557b5-f7be-4e5d-9146-7e3227cda887",
    "before": {
      "text": "Find the HCF of 1250 and 1050.",
      "options": [
        "90",
        "60",
        "80",
        "70",
        "50"
      ],
      "answer": "50"
    },
    "after": {
      "text": "Find the LCM of 300 and 450.",
      "options": [
        "990",
        "960",
        "880",
        "870",
        "900"
      ],
      "answer": "900"
    }
  },
  {
    "sourceId": "L17-C4",
    "orderIndex": 4,
    "videoId": "bfa08ad0-9494-4503-b47d-22a685ae5a0e",
    "before": {
      "text": "Find the LCM of 324 and 1890.",
      "options": [
        "11434",
        "11430",
        "11304",
        "11504",
        "11340"
      ],
      "answer": "11340"
    },
    "after": {
      "text": "Find the LCM of 450 and 560.",
      "options": [
        "25434",
        "25430",
        "25304",
        "25504",
        "25200"
      ],
      "answer": "25200"
    }
  },
  {
    "sourceId": "L17-C5",
    "orderIndex": 5,
    "videoId": "34875a64-da61-478c-9dc0-f6402915379e",
    "before": {
      "text": "Find the HCF of 324 and 1890.",
      "options": [
        "55",
        "53",
        "52",
        "51",
        "54"
      ],
      "answer": "54"
    },
    "after": {
      "text": "Find the LCM of 300 and 1050.",
      "options": [
        "2500",
        "2300",
        "2200",
        "5100",
        "2100"
      ],
      "answer": "2100"
    }
  },
  {
    "sourceId": "L17-C6",
    "orderIndex": 6,
    "videoId": "b7b69550-eabb-417d-babc-64a7d2f5173e",
    "before": {
      "text": "Find the LCM of 1960 and 8232.",
      "options": [
        "61401",
        "14160",
        "16140",
        "11460",
        "41160"
      ],
      "answer": "41160"
    },
    "after": {
      "text": "Find the LCM of 1960 and 8232.",
      "options": [
        "61401",
        "14160",
        "16140",
        "11460",
        "41160"
      ],
      "answer": "41160"
    }
  },
  {
    "sourceId": "L17-C7",
    "orderIndex": 7,
    "videoId": "fd986493-f844-4c78-8376-ccfa852c314a",
    "before": {
      "text": "Find the HCF of 1260 and 1050.",
      "options": [
        "160",
        "209",
        "180",
        "170",
        "210"
      ],
      "answer": "210"
    },
    "after": {
      "text": "Find the HCF of 1260 and 1050.",
      "options": [
        "160",
        "209",
        "180",
        "170",
        "210"
      ],
      "answer": "210"
    }
  },
  {
    "sourceId": "L17-C8",
    "orderIndex": 8,
    "videoId": "b742ee7e-ebb9-4e81-aef9-870d0dce500d",
    "before": {
      "text": "Find the HCF of 1250 and 2310.",
      "options": [
        "11",
        "12",
        "8",
        "9",
        "10"
      ],
      "answer": "10"
    },
    "after": {
      "text": "Find the LCM of 1250 and 1050.",
      "options": [
        "11310",
        "12420",
        "26451",
        "26820",
        "26250"
      ],
      "answer": "26250"
    }
  },
  {
    "sourceId": "L17-C9",
    "orderIndex": 9,
    "videoId": "f280965e-8301-494a-a71e-f7d3b07548d3",
    "before": {
      "text": "Find the LCM of 1250 and 2310.",
      "options": [
        "278580",
        "288570",
        "285750",
        "287550",
        "288750"
      ],
      "answer": "288750"
    },
    "after": {
      "text": "Find the HCF of 1250 and 2310.",
      "options": [
        "80",
        "70",
        "75",
        "50",
        "10"
      ],
      "answer": "10"
    }
  },
  {
    "sourceId": "L17-C10",
    "orderIndex": 10,
    "videoId": "721f8e8c-8d0a-4f88-bc65-c3c820d350b8",
    "before": {
      "text": "Find the LCM of 36 and 84.",
      "options": [
        "254",
        "256",
        "258",
        "242",
        "252"
      ],
      "answer": "252"
    },
    "after": {
      "text": "Find the LCM of 1250 and 2310.",
      "options": [
        "254123",
        "256626",
        "258775",
        "242620",
        "288750"
      ],
      "answer": "288750"
    }
  }
];

const sameOptions = (a: unknown, b: string[]) => Array.isArray(a) && a.every(x => typeof x === "string") &&
  JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

export function planRepair(rows: any[]) {
  if (rows.length !== repairs.length) throw new Error("Expected exactly ten target questions.");
  return repairs.map(repair => {
    const matches = rows.filter(row => row.source_id === repair.sourceId);
    if (matches.length !== 1) throw new Error("Missing or repeated question identity.");
    const row = matches[0];
    if (row.difficulty !== "challenging" || row.order_index !== repair.orderIndex || row.solution_video_id !== repair.videoId || row.diagram != null)
      throw new Error("Question position, diagram or video differs from the reviewed baseline.");
    let options: unknown;
    try { options = JSON.parse(row.options_json); } catch { throw new Error("Invalid existing answer options."); }
    const matchesContent = (c: Content) => row.question_text === c.text && row.correct_answer === c.answer && sameOptions(options, c.options);
    if (matchesContent(repair.after)) return { repair, id: row.id, pending: false };
    if (!matchesContent(repair.before)) throw new Error("Question content differs from both reviewed versions.");
    return { repair, id: row.id, pending: true };
  });
}

export async function repairLargeNumberChallenging(apply = false) {
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
          [repair.after.text, JSON.stringify(repair.after.options), repair.after.answer, id, lessonId, repair.sourceId, "challenging"]);
        if (result.affectedRows !== 1) throw new Error("Unexpected update count; rolling back.");
      }
      const [updated] = await connection.query(select, [lessonId, ...sources]);
      if (planRepair(updated).some(p => p.pending)) throw new Error("Post-update verification failed.");
      await connection.commit(); committed = true;
      console.log("APPLIED: " + pending.length + " Challenging question corrections; all ten verified.");
    } else console.log("DRY RUN: " + pending.length + " corrections pending. No records changed. Run with --apply to save.");
    console.log("Video IDs, Easy and Medium questions, attempts, scores, approvals and customer records were not changed. Existing attempts retain their saved questions; start a new Challenging attempt after the repair.");
  } finally {
    try { if (!committed) await connection.rollback(); } finally { connection.release(); }
  }
}

if (process.argv[1]?.replace(/\\/g, "/").endsWith("/repairLargeNumberChallenging.js")) {
  const args = process.argv.slice(2);
  if (args.length > 1 || args.length === 1 && args[0] !== "--apply") {
    console.error("Usage: repairLargeNumberChallenging.js [--apply]"); process.exit(1);
  }
  repairLargeNumberChallenging(args[0] === "--apply").then(() => process.exit(0)).catch(() => {
    console.error("Repair stopped. Staging access or reviewed content checks failed. Uncommitted changes were rolled back.");
    process.exit(1);
  });
}
