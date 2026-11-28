import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const stagingOrigin = 'https://schrool-platform-staging-3583c1139100.herokuapp.com';
const [mode, ...extra] = process.argv.slice(2);
if (!['--check', '--preview', '--apply'].includes(mode) || extra.length) {
  console.error('Usage: node scripts/import-y7-lesson-05.mjs --check|--preview|--apply');
  process.exit(1);
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function assert(value, message) { if (!value) throw new Error(message); }
export function validate(lesson) {
  assert(lesson.formatVersion === 1 && lesson.courseTitle === 'Math II Year 7' &&
    lesson.sourceLessonNumber === 5 && lesson.title === 'Writing Percentages as Fractions' &&
    lesson.bunnyLibraryId === 360729 && uuid.test(lesson.bunnyVideoId), 'Unexpected lesson metadata.');
  assert(Array.isArray(lesson.questions) && lesson.questions.length === 30, 'Expected 30 questions.');
  const ids = new Set(), videos = new Set([lesson.bunnyVideoId]), positions = new Set();
  for (const q of lesson.questions) {
    assert(['easy', 'medium', 'challenging'].includes(q.difficulty) &&
      Number.isInteger(q.orderIndex) && q.orderIndex >= 1 && q.orderIndex <= 10, 'Invalid level or question position.');
    assert(q.sourceId === `Y7L05-${q.difficulty[0].toUpperCase()}${q.orderIndex}` && !ids.has(q.sourceId), 'Duplicate or invalid source ID.');
    assert(typeof q.questionText === 'string' && q.questionText.trim() && q.diagram === null, 'Invalid question text or diagram.');
    assert(Array.isArray(q.options) && q.options.length === 5 &&
      q.options.every(x => typeof x === 'string' && x.trim()) && new Set(q.options).size === 5 &&
      q.correctAnswer === q.options[4], 'Invalid answer options.');
    assert(uuid.test(q.solutionVideoId) && !videos.has(q.solutionVideoId), 'Duplicate or invalid video ID.');
    ids.add(q.sourceId); videos.add(q.solutionVideoId); positions.add(`${q.difficulty}:${q.orderIndex}`);
  }
  assert(positions.size === 30, 'Missing or duplicate question positions.');
}
async function run() {
  const bytes = Buffer.from((await readFile(new URL('../server/y7-lesson-05.json', import.meta.url), 'utf8')).replace(/\r\n/g, '\n'));
  const lesson = JSON.parse(bytes);
  validate(lesson);
  const expectedHash = (await readFile(new URL('../server/y7-lesson-05.sha256', import.meta.url), 'utf8')).trim();
  assert(createHash('sha256').update(bytes).digest('hex') === expectedHash, 'Lesson file differs from the checked package.');
  console.log('Validated Year 7 Lesson 5: 30 questions, 1 explainer and 30 unique solution videos.');
  if (mode === '--check') return;
  assert(process.env.APP_BASE_URL?.trim() === stagingOrigin &&
    process.env.DATABASE_URL && process.env.DATABASE_URL === process.env.JAWSDB_URL, 'Staging configuration check failed.');
  const { eq, sql } = await import('drizzle-orm');
  const { courses, lessons, lessonQuestions } = await import('../dist-server/drizzle/schema.js');
  const { getDb } = await import('../dist-server/server/db.js');
  const db = await getDb();
  const result = await db.transaction(async tx => {
    // Existing course row serialises cooperating imports, without changing its data.
    const [foundation] = await tx.select().from(courses).where(eq(courses.id, 2)).for('update');
    assert(foundation?.title === 'Math I Year 5/6', 'Expected staging foundation course was not found.');
    const allCourses = await tx.select().from(courses);
    const candidates = allCourses.filter(c => /year\s*7/i.test(c.title ?? ''));
    assert(candidates.length <= 1 && (!candidates.length || candidates[0].title === lesson.courseTitle), 'Existing Year 7 course needs review.');
    const courseId = candidates[0]?.id;
    assert(courseId === 3, 'Expected Year 7 staging course ID 3 was not found.');
    const inventory = await tx.select().from(lessons).where(eq(lessons.courseId, courseId));
    const predecessor = inventory.filter(l => l.orderIndex === 4 && l.title === 'Changing Decimals to Fractions');
    assert(predecessor.length === 1 && predecessor[0].id === 29, 'Verified Year 7 Lesson 4 was not found.');
    const matches = inventory.filter(l => l.orderIndex === 5 || l.title === lesson.title);
    assert(matches.length <= 1, 'Conflicting Year 7 Lesson 5 records.');
    const expected = lesson.questions.map(q => {
      const { options, ...fields } = q;
      return { ...fields, optionsJson: JSON.stringify(options) };
    });
    if (matches.length) {
      const existing = matches[0];
      assert(existing.title === lesson.title && existing.orderIndex === 5 &&
        existing.bunnyLibraryId === lesson.bunnyLibraryId && existing.bunnyVideoId === lesson.bunnyVideoId, 'Existing Lesson 5 differs; stopped without overwriting.');
      const saved = await tx.select().from(lessonQuestions).where(eq(lessonQuestions.lessonId, existing.id));
      assert(saved.length === 30 && expected.every(q => {
        const row = saved.find(x => x.sourceId === q.sourceId);
        return row && Object.entries(q).every(([key, value]) => row[key] === value);
      }), 'Existing questions differ; stopped without overwriting.');
      return 'Year 7 Lesson 5 is already imported and matches exactly.';
    }
    if (mode === '--preview') return 'PREVIEW: would add Lesson 5 and 30 questions to the existing Year 7 course. No changes made.';
    const [{ id: lessonId }] = await tx.insert(lessons).values({ courseId, title: lesson.title,
      orderIndex: 5, bunnyLibraryId: lesson.bunnyLibraryId, bunnyVideoId: lesson.bunnyVideoId }).$returningId();
    await tx.insert(lessonQuestions).values(expected.map(q => ({ ...q, lessonId })));
    const [count] = await tx.select({ count: sql`COUNT(*)` }).from(lessonQuestions).where(eq(lessonQuestions.lessonId, lessonId));
    assert(Number(count.count) === 30, 'Inserted question count differs; rolling back.');
    return `Imported Year 7 Lesson 5 with 30 questions. Course ID ${courseId}; lesson ID ${lessonId}.`;
  });
  console.log(result);
  console.log('Year 5/6 data, enrolments, payments and access settings were not changed.');
}
run().then(() => process.exit(0)).catch(error => { console.error(error.message); process.exit(1); });
