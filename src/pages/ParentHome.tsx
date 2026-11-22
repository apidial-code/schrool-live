import { useState } from "react";
import { trpc } from "../lib/trpc";
import { courseLevels } from "../../shared/courseProgress";
const box="rounded-xl border border-blue-100 bg-white p-5 space-y-3";
const date=(v:Date|string|null,zone="Australia/Sydney")=>v?new Date(v).toLocaleString("en-AU",{timeZone:zone}):"Not recorded";
export default function ParentHome() {
  const list=trpc.parent.enrollments.useQuery(undefined,{retry:false,staleTime:0});
  const [selected,setSelected]=useState<number|null>(null);
  const logout=trpc.auth.logout.useMutation({retry:false});
  const [message,setMessage]=useState("");
  const current=selected!==null && list.data?.some(r=>r.id===selected)?selected:null;
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-900"><div className="mx-auto max-w-6xl space-y-5">
    <header className="flex justify-between gap-3"><h1 className="text-3xl font-semibold">Parent dashboard</h1><button disabled={logout.isPending} onClick={async()=>{try{await logout.mutateAsync();window.location.replace("/login");}catch{setMessage("Unable to sign out. Please try again.");}}}>Sign out</button></header>
    <p>View your linked child's course progress and teaching records. Dates use Australia/Sydney unless the schedule states otherwise.</p>
    {message && <p role="alert">{message}</p>}
    <section className={box}><h2 className="text-xl font-semibold">Your linked enrolments</h2>
      {list.isLoading?<p>Loading family records…</p>:list.error?<p role="alert">Unable to load family records. <button onClick={()=>list.refetch()}>Retry</button></p>:!list.data?.length?<p>No verified enrolment links yet. Contact Schrool Admin to verify your family access.</p>:<ul>{list.data.map(r=><li key={r.id} className="border-t py-3"><button className="text-blue-800 underline" onClick={()=>setSelected(r.id)}>{r.studentName??"Student"} · {r.yearLevel} · {r.tier} · Enrolment #{r.id}</button><p>{r.status}</p></li>)}</ul>}
      <button className="underline" disabled={list.isFetching} onClick={()=>list.refetch()}>Refresh family links</button>
    </section>
    {current!==null && !list.isFetching && !list.error && <FamilyRecord key={current} enrollmentId={current}/>}
  </div></main>;
}
function FamilyRecord({enrollmentId}:{enrollmentId:number}) {
  const overview=trpc.parent.overview.useQuery({enrollmentId},{retry:false,staleTime:0,gcTime:0});
  if(overview.isLoading)return <p>Loading enrolment…</p>;
  if(overview.error || !overview.data)return <p role="alert">This family record is unavailable. Refresh family links or contact Admin.</p>;
  const {enrollment:r,progress}=overview.data;
  return <><section className={box}><h2 className="text-xl font-semibold">{r.studentName} · Enrolment #{r.id}</h2>
    <p>{r.yearLevel} · {r.tier} · Status: {r.status} · Payment: {r.paymentStatus}</p>
    <p>Access activated: {date(r.activatedAt)}</p><p>Access ends: {r.tier==="elite" && r.status==="active" && !r.accessEndsAt?"On confirmed course completion":date(r.accessEndsAt)}</p>
    <h3 className="font-semibold">Learning progress</h3><p>{progress.filter(l=>l.completed).length} of {progress.length} lessons passed at all three difficulties.</p>
    <p>Best valid scores exclude questions whose worked solutions were opened before submission.</p>
    {r.tier==="elite" && <p>Exercise progress is separate from tutor approval, teaching hours and five-question requirements.</p>}
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Lesson</th>{courseLevels.map(l=><th key={l} className="capitalize">{l}</th>)}</tr></thead><tbody>{progress.map(l=><tr key={l.id} className="border-t"><th className="p-2 font-normal">{l.title}{l.completed?" · Passed":""}</th>{courseLevels.map(level=><td className="p-2" key={level}>{l.levels[level].bestScore===null?"No submitted score":`${l.levels[level].bestScore}/10`}<br/>{l.levels[level].attempts} submitted{l.levels[level].active?" · Attempt saved":""}</td>)}</tr>)}</tbody></table></div>
  </section>{r.tier==="elite" && <><FamilySchedule enrollmentId={enrollmentId}/><FamilyReports enrollmentId={enrollmentId}/></>}</>;
}
function FamilySchedule({enrollmentId}:{enrollmentId:number}) {
  const result=trpc.parent.schedule.useQuery({enrollmentId},{retry:false,staleTime:0,gcTime:0});const d=result.data;
  return <section className={box}><h2 className="text-xl font-semibold">Elite teaching schedule</h2>
    {result.isLoading?<p>Loading schedule…</p>:result.error?<p role="alert">Schedule unavailable.</p>:d && <><p>Regular tutor: {d.tutor??"Not allocated"} · Time zone: {d.timezone}</p>
      {!d.sessions.length?<p>No teaching sessions allocated yet.</p>:<details><summary>View all {d.sessions.length} teaching bookings</summary><ol className="list-decimal pl-6">{d.sessions.map((s:any)=><li key={s.id} className="border-t py-2">Session {s.sequence} · {date(s.startsAt,d.timezone)} · {s.lessonTitle} · {s.status}{s.tutor && ` · Tutor: ${s.tutor}`}</li>)}</ol></details>}</>}
  </section>;
}
function FamilyReports({enrollmentId}:{enrollmentId:number}) {
  const [page,setPage]=useState(0);const result=trpc.parent.reports.useQuery({enrollmentId,page},{retry:false,staleTime:0,gcTime:0});
  return <section className={box}><h2 className="text-xl font-semibold">Tutor session reports</h2>
    {result.isFetching?<p>Loading reports…</p>:result.error?<p role="alert">Reports unavailable.</p>:<>{!result.data?.rows.length && <p>No tutor reports recorded.</p>}{result.data?.rows.map((r:any)=><details key={r.id} className="rounded border p-3"><summary>Session {r.sequence} · {r.author??"Tutor"} · {date(r.createdAt)} · Report #{r.id}{r.revisionOf?` · Correction of report #${r.revisionOf}`:""}</summary>
      {[["1. Lesson taught and starting understanding",r.lessonUnderstanding],["2. Next session's aim",r.nextObjectives],["3. Progress and difficulties",r.progressDifficulties],["4. Work before the next session",r.assignedWork],["5. Tutor's comments",r.tutorComments]].map(([label,value])=><div key={label}><h3 className="mt-3 font-semibold">{label}</h3><p className="whitespace-pre-wrap">{value}</p></div>)}</details>)}</>}
    <nav className="flex gap-4"><button disabled={!page || result.isFetching} onClick={()=>setPage(page-1)}>Previous</button><span>Page {page+1}</span><button disabled={!result.data?.hasMore || result.isFetching} onClick={()=>setPage(page+1)}>Next</button></nav>
  </section>;
}
