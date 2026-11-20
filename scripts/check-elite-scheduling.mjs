import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
const source=fs.readFileSync(new URL("../shared/eliteSchedule.ts",import.meta.url),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}}).outputText;
const {buildTeachingSchedule,localParts,wallTime,covered,overlaps,validDay,reportReady}=
  await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
const lessons=Array.from({length:23},(_,i)=>i+1),slots=[{day:5,minute:1080},{day:2,minute:1080}];
const sessions=buildTeachingSchedule("2026-09-28","Australia/Sydney",slots,lessons);
assert.equal(sessions.length,46);
assert.equal(new Set(sessions.map(s=>s.startsAt.toISOString())).size,46);
for(let i=0;i<46;i++){
  assert.equal(sessions[i].sequence,i+1);
  assert.equal(sessions[i].lessonId,Math.floor(i/2)+1);
  assert.equal(sessions[i].endsAt-sessions[i].startsAt,3600000);
  assert.equal(localParts(sessions[i].startsAt,"Australia/Sydney").minute,1080);
  assert.equal(covered(sessions[i].startsAt,sessions[i].endsAt,"Australia/Sydney",
    [{day:2,start:1020,end:1200},{day:5,start:1020,end:1200}]),true);
}
assert.equal(sessions[0].startsAt.toISOString(),"2026-09-29T08:00:00.000Z");
assert.equal(sessions[2].startsAt.toISOString(),"2026-10-06T07:00:00.000Z");
assert.equal(covered(sessions[0].startsAt,sessions[0].endsAt,"UTC",[{day:2,start:480,end:540}]),true);
assert.equal(covered(sessions[2].startsAt,sessions[2].endsAt,"UTC",[{day:2,start:480,end:540}]),false);
assert.throws(()=>wallTime("2026-10-04",150,"Australia/Sydney"));
assert.throws(()=>wallTime("2026-04-05",150,"Australia/Sydney"));
assert.equal(wallTime("2026-11-23",1080,"Asia/Kolkata").toISOString(),"2026-11-23T12:30:00.000Z");
assert.equal(validDay("2026-02-30"),false);
assert.throws(()=>buildTeachingSchedule("2026-09-29","Australia/Sydney",slots,lessons));
assert.throws(()=>buildTeachingSchedule("2026-09-28","Australia/Sydney",[slots[0],slots[0]],lessons));
assert.throws(()=>buildTeachingSchedule("2026-09-28","Australia/Sydney",slots,lessons.slice(1)));
assert.equal(overlaps(sessions[0],{startsAt:sessions[0].endsAt,endsAt:new Date(+sessions[0].endsAt+3600000)}),false);
assert.equal(overlaps(sessions[0],{startsAt:new Date(+sessions[0].startsAt+1800000),endsAt:new Date(+sessions[0].endsAt+1800000)}),true);
assert.equal(reportReady(sessions[0].startsAt,sessions[0].endsAt,+sessions[0].endsAt-1),false);
assert.equal(reportReady(sessions[0].startsAt,sessions[0].endsAt,+sessions[0].endsAt),true);
console.log("46-session sequencing, time zones, daylight-saving boundaries, availability, overlap and report timing checks passed.");
