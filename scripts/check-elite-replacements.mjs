import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source=await readFile(new URL("../shared/eliteReplacement.ts",import.meta.url),"utf8");
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText;
const {replacementPlan,bookingFingerprint,teachingComplete,nextReplacement}=await import("data:text/javascript;base64,"+Buffer.from(js).toString("base64"));
const now=Date.parse("2026-11-21T00:00:00Z"),hour=3600000,day=86400000;
const rows=Array.from({length:46},(_,i)=>({id:i+1,sequence:i+1,lessonId:Math.floor(i/2)+1,
  startsAt:new Date(now+(i===0?-1:i+1)*day),endsAt:new Date(now+(i===0?-1:i+1)*day+hour),status:i===0?"missed":"scheduled"}));
const extra=replacementPlan(rows,1,"extra",new Date(now+hour),now);
assert.equal(extra.additions.length,1);assert.equal(extra.additions[0].lessonId,1);assert.equal(extra.changes.length,0);
assert.equal(extra.fingerprint,bookingFingerprint(rows));
assert.throws(()=>replacementPlan(rows,1,"extra",new Date(now+3*day),now));
assert.throws(()=>replacementPlan(rows,1,"extra",new Date(now+15*day),now));
const shifted=replacementPlan(rows,1,"next_regular",new Date(now+48*day),now-1);
assert.equal(shifted.replacementId,2);assert.equal(shifted.changes.length,45);assert.equal(shifted.additions[0].lessonId,23);
const lessons=shifted.changes.map(c=>c.lessonId).concat(shifted.additions.map(s=>s.lessonId));
for(let lesson=1;lesson<=23;lesson++)assert.equal(lessons.filter(n=>n===lesson).length,2);
assert.throws(()=>replacementPlan(rows,1,"next_regular",new Date(now+5*day),now-1));
assert.throws(()=>replacementPlan([{...rows[0]},...rows.slice(1).map(s=>({...s,status:"delivered"}))],1,"next_regular",new Date(now+48*day),now-1));
const delivered=rows.map(s=>({...s,status:s.id===1?"missed":"delivered"}));
delivered.push({...rows[0],id:47,sequence:47,status:"delivered"});
const ids=delivered.filter(s=>s.status==="delivered").map(s=>s.id);
assert(teachingComplete(delivered,[{originalId:1,replacementId:47,status:"delivered"}],ids));
assert(!teachingComplete(delivered,[{originalId:1,replacementId:47,status:"approved"}],ids));
assert(!teachingComplete(delivered,[{originalId:1,replacementId:47,status:"delivered"}],ids.filter(id=>id!==47)));
assert(!teachingComplete(delivered.slice(0,-1),[],ids));
// A replacement which is itself missed retains both approved fee records, while
// a later delivered catch-up resolves the teaching chain without losing reports.
const chained=delivered.map(s=>s.id===47?{...s,status:"missed"}:s);
chained.push({...rows[0],id:48,sequence:48,status:"delivered"});
const chain=[{id:1,originalId:1,replacementId:47,status:"delivered"},{id:2,originalId:47,replacementId:48,status:"delivered"}];
assert(teachingComplete(chained,chain,[...ids,48]));
const pending=chain.map(c=>({...c,status:c.id===1?"approved":"awaiting_plan"}));
assert.equal(nextReplacement(pending,chained).id,2);
assert.equal(nextReplacement([],chained),undefined);
console.log("Extra-hour catch-up, next-session lesson shifts, two-week limits, preservation of all 46 teaching hours and completion/report checks passed.");
