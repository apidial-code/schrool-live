import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";

const source = fs.readFileSync(new URL("../shared/courseAccessPeriod.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ES2022 } }).outputText;
const { accessPeriodOpen } = await import("data:text/javascript;base64," + Buffer.from(js).toString("base64"));
const now = Date.parse("2026-11-20T00:00:00Z");
assert.equal(accessPeriodOpen("elite", null, now), true);
assert.equal(accessPeriodOpen("standard", null, now), false);
assert.equal(accessPeriodOpen(null, null, now), false);
for (const tier of ["standard", "elite"]) {
  assert.equal(accessPeriodOpen(tier, new Date(now + 1), now), true);
  assert.equal(accessPeriodOpen(tier, new Date(now), now), false);
  assert.equal(accessPeriodOpen(tier, new Date(now - 1), now), false);
  assert.equal(accessPeriodOpen(tier, new Date(NaN), now), false);
}
console.log("Elite completion-based and Standard dated access checks passed.");
