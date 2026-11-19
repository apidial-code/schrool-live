import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(new URL("../shared/courseProgress.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { courseOverview, lessonScores } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

assert.deepEqual(lessonScores([]).easy, { bestScore: null, attempts: 0, active: false });
const scores = lessonScores([
  { difficulty: "easy", best: "0", submitted: "1", active: "0" },
  { difficulty: "medium", best: null, submitted: 0, active: 1 },
]);
assert.equal(scores.easy.bestScore, 0);
assert.equal(scores.easy.attempts, 1);
assert.equal(scores.medium.bestScore, null);
assert.equal(scores.medium.active, true);
assert.equal(courseOverview([]).courseComplete, false);
const lessons = Array.from({ length: 23 }, (_, id) => ({
  id, completed: id < 22, unlocked: true, standard: true,
}));
assert.equal(courseOverview(lessons).percentage, 95);
assert.equal(courseOverview(lessons).courseComplete, false);
assert.equal(courseOverview(lessons).nextLesson.id, 22);
lessons[22].completed = true;
assert.equal(courseOverview(lessons).percentage, 100);
assert.equal(courseOverview(lessons).courseComplete, true);
assert.equal(courseOverview(lessons).nextLesson, null);
assert.equal(courseOverview(lessons.map(row => ({ ...row, standard: false }))).courseComplete, false);
assert.equal(courseOverview([{ completed: false, unlocked: false, standard: true }]).nextLesson, null);
console.log("Course progress checks passed.");
