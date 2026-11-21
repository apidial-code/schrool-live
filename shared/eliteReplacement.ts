export type TeachingBooking = {id:number;sequence:number;lessonId:number;startsAt:Date;endsAt:Date;status:string};
export type ReplacementPlan = {mode:"extra"|"next_regular"; fingerprint:string; replacementId:number|null;
  additions:{sequence:number;lessonId:number;startsAt:string;endsAt:string}[];
  changes:{id:number;lessonId:number;previousLessonId:number}[]};
export function bookingFingerprint(rows:TeachingBooking[]) {
  return JSON.stringify([...rows].sort((a,b)=>a.id-b.id).map(s=>[s.id,s.sequence,s.lessonId,s.startsAt.toISOString(),s.endsAt.toISOString(),s.status]));
}
// Teaching hours remain immutable. Only future, undelivered lesson assignments move.
export function replacementPlan(rows:TeachingBooking[],originalId:number,mode:"extra"|"next_regular",extraAt:Date,now=Date.now()):ReplacementPlan {
  const original=rows.find(s=>s.id===originalId);
  if(!original || original.status!=="missed") throw new Error("A recorded missed session is required.");
  if(!Number.isFinite(extraAt.getTime()) || extraAt.getTime()<=now) throw new Error("Choose a future additional teaching hour.");
  const end=new Date(extraAt.getTime()+3600000);
  const ordered=rows.filter(s=>s.startsAt>original.startsAt && s.status!=="cancelled" && s.status!=="missed" && s.status!=="delivered").sort((a,b)=>+a.startsAt-+b.startsAt);
  const plan:ReplacementPlan={mode,fingerprint:bookingFingerprint(rows),replacementId:null,additions:[],changes:[]};
  let lessonId=original.lessonId;
  if(mode==="next_regular") {
    const next=ordered[0];
    if(!next || next.status!=="scheduled" || +next.startsAt<=now || +next.startsAt>+original.startsAt+14*86400000)
      throw new Error("The next booked hour must be future, undelivered and within two weeks of the missed session.");
    if(ordered.some(s=>s.status!=="scheduled" || +s.startsAt<=now)) throw new Error("Resolve earlier missed hours and reports before shifting this lesson sequence.");
    if(+extraAt<+ordered[ordered.length-1].endsAt) throw new Error("Choose an additional final hour after the existing course schedule.");
    plan.replacementId=next.id;
    for(const session of ordered) {
      plan.changes.push({id:session.id,lessonId,previousLessonId:session.lessonId});
      lessonId=session.lessonId;
    }
  } else {
    if(+extraAt>+original.startsAt+14*86400000) throw new Error("Arrange the replacement within two weeks of the missed session.");
    if(ordered.some(s=>+s.startsAt<+end)) throw new Error("Use the next regular hour for catch-up, or arrange the extra hour before the next booked session to preserve lesson order.");
  }
  plan.additions.push({sequence:Math.max(...rows.map(s=>s.sequence))+1,lessonId,startsAt:extraAt.toISOString(),endsAt:end.toISOString()});
  return plan;
}
export type ReplacementCase = {id:number;originalId:number;replacementId:number|null;status:string};
// Follow a missed replacement down to its own catch-up case. The oldest unfinished
// teaching chain takes priority over a later lesson or a different absence.
export function nextReplacement<T extends ReplacementCase>(cases:T[],rows:{id:number;startsAt:Date}[]):T|undefined {
  const open=cases.filter(c=>c.status!=="delivered");
  const roots=open.filter(c=>!open.some(parent=>parent.replacementId===c.originalId));
  let current=roots.sort((a,b)=>+(rows.find(s=>s.id===a.originalId)?.startsAt??0)-+(rows.find(s=>s.id===b.originalId)?.startsAt??0))[0];
  const seen=new Set<number>();
  while(current && !seen.has(current.id)) {
    seen.add(current.id);const child=open.find(c=>c.originalId===current.replacementId);
    if(!child)return current;current=child;
  }
  return undefined;
}
export function teachingComplete(rows:{id:number;status:string}[],cases:{originalId:number;replacementId:number|null;status:string}[],reportedIds:number[]) {
  if(rows.filter(s=>s.status!=="missed" && s.status!=="cancelled").length!==46) return false;
  function resolved(id:number,seen=new Set<number>()):boolean {
    if(seen.has(id))return false;seen.add(id);
    const session=rows.find(s=>s.id===id);
    if(session?.status==="delivered")return reportedIds.includes(id);
    const replacement=cases.find(c=>c.originalId===id && c.status==="delivered");
    return session?.status==="missed" && !!replacement?.replacementId && resolved(replacement.replacementId,seen);
  }
  return rows.every(s=>resolved(s.id));
}
