import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { weekdays, type AvailabilityWindow } from "../../shared/eliteSchedule";
import { EliteReports, reportLabels, sessionDate } from "../components/EliteScheduleView.tsx";

import { MissedSession, ReplacementCases } from "../components/EliteReplacement.tsx";

export default function TeacherElitePortal() {
  const availability=trpc.eliteScheduling.myAvailability.useQuery(undefined,{retry:false,staleTime:0});
  const [page,setPage]=useState(0);
  const sessions=trpc.eliteScheduling.mySessions.useQuery({page},{retry:false,staleTime:0});
  const save=trpc.eliteScheduling.saveAvailability.useMutation({retry:false});
  const logout=trpc.auth.logout.useMutation({retry:false});
  const [timezone,setTimezone]=useState("Australia/Sydney"),[commit,setCommit]=useState(false),[message,setMessage]=useState("");
  const [windows,setWindows]=useState<AvailabilityWindow[]>(weekdays.map((_,day)=>({day,start:1020,end:1200})));
  const [selected,setSelected]=useState<number|null>(null);
  useEffect(()=>{if(availability.data){setTimezone(availability.data.timezone);if(availability.data.windows.length)setWindows(availability.data.windows);setCommit(availability.data.committed);}},[availability.data]);
  const selectedSession=sessions.data?.rows.find(s=>s.id===selected);
  const clock=(minute:number)=>String(Math.floor(minute/60)).padStart(2,"0")+":"+String(minute%60).padStart(2,"0");
  const minute=(value:string)=>{const [h,m]=value.split(":").map(Number);return h*60+m;};
  return <main className="mx-auto max-w-5xl space-y-5 p-6">
    <button className="text-blue-800 underline" disabled={logout.isPending} onClick={async()=>{try{await logout.mutateAsync();window.location.replace("/login");}catch{setMessage("Unable to sign out. Try again.");}}}>Sign out</button>
    <h1 className="text-2xl font-semibold">Elite teaching commitments</h1>
    <section className="rounded border p-5 space-y-3"><h2 className="text-xl font-semibold">Regular availability</h2>
      {availability.isLoading?<p>Loading availability…</p>:availability.error?<p role="alert">Unable to load availability.</p>:!availability.data?.approved?<p>Admin approval for Year 5/6 Elite is required before committing availability.</p>:<>
        <label className="block">Your time zone<input className="ml-3 rounded border p-2" value={timezone} onChange={e=>setTimezone(e.target.value)}/></label>
        {weekdays.map((day,index)=>{const window=windows.find(w=>w.day===index);return <div key={day} className="flex flex-wrap items-center gap-3">
          <label><input type="checkbox" checked={!!window} onChange={e=>setWindows(e.target.checked?[...windows,{day:index,start:1020,end:1200}]:windows.filter(w=>w.day!==index))}/> {day}</label>
          {window && <><label>From<input type="time" step="1800" className="ml-2 rounded border p-2" value={clock(window.start)} onChange={e=>setWindows(windows.map(w=>w.day===index?{...w,start:minute(e.target.value)}:w))}/></label>
          <label>To<input type="time" step="1800" className="ml-2 rounded border p-2" value={clock(window.end)} onChange={e=>setWindows(windows.map(w=>w.day===index?{...w,end:minute(e.target.value)}:w))}/></label></>}
        </div>;})}
        <label className="block"><input type="checkbox" checked={commit} onChange={e=>setCommit(e.target.checked)}/> I commit to both weekly sessions for each allocated student's complete course and to documenting every delivered session. Availability changes must preserve existing bookings; unavoidable changes require Admin review.</label>
        <button disabled={save.isPending || !commit || !windows.length} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50" onClick={async()=>{setMessage("");try{await save.mutateAsync({timezone,windows,commitsToCourse:true});setMessage("Regular availability and course commitment saved.");await availability.refetch();}catch(e){setMessage(e instanceof Error?e.message:"Unable to save.");}}}>Save regular availability and commitment</button>
      </>}
      {message && <p role="status">{message}</p>}
    </section>
    <section className="rounded border p-5 space-y-3"><h2 className="text-xl font-semibold">My teaching sessions</h2>
      <p>Times below use {availability.data?.timezone??"Australia/Sydney"}. Open a session to review the teaching record and document delivery.</p>
      {sessions.isLoading?<p>Loading sessions…</p>:sessions.error?<p role="alert">Unable to load sessions.</p>:!sessions.data?.rows.length?<p>No sessions allocated yet.</p>:<ul className="max-h-96 overflow-auto divide-y">{sessions.data.rows.map(s=><li key={s.id} className="py-2"><button className="text-left text-blue-800 underline" onClick={()=>setSelected(s.id)}>{sessionDate(s.startsAt,availability.data?.timezone)} · {s.studentName} · Session {s.sequence} · {s.lessonTitle} · {s.status}</button></li>)}</ul>}
      <nav className="flex gap-4" aria-label="Teaching session pages"><button disabled={!page || sessions.isFetching} onClick={()=>{setSelected(null);setPage(page-1);}}>Previous</button><span>Page {page+1}</span><button disabled={!sessions.data?.hasMore || sessions.isFetching} onClick={()=>{setSelected(null);setPage(page+1);}}>Next</button></nav>
    </section>
    {selectedSession && <><MissedSession key={"missed-"+selectedSession.id} session={selectedSession} onSaved={()=>{void sessions.refetch();}}/><ReplacementCases key={"replacement-"+selectedSession.id+selectedSession.status} enrollmentId={selectedSession.enrollmentId} onSaved={()=>{void sessions.refetch();}}/><SessionReport key={selectedSession.id} session={selectedSession} onSaved={()=>{void sessions.refetch();}}/></>}
  </main>;
}
type Session={id:number;enrollmentId:number;sequence:number;studentName:string|null;lessonTitle:string|null;startsAt:Date|string;endsAt:Date|string;status:string};
function SessionReport({session,onSaved}:{session:Session;onSaved:()=>void}) {
  const history=trpc.eliteScheduling.reports.useQuery({enrollmentId:session.enrollmentId},{retry:false,staleTime:0});
  const latest=history.data?.find(r=>r.sessionId===session.id);
  const empty={lessonUnderstanding:"",nextObjectives:"",progressDifficulties:"",assignedWork:"",tutorComments:""};
  const [fields,setFields]=useState(empty),[delivered,setDelivered]=useState(false),[message,setMessage]=useState("");
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID());
  const submit=trpc.eliteScheduling.submitReport.useMutation({retry:false});
  useEffect(()=>{setFields(latest?Object.fromEntries(reportLabels.map(([key])=>[key,latest[key]])) as typeof empty:empty);setDelivered(false);setRequestId(crypto.randomUUID());},[latest?.id]);
  const ended=new Date(session.endsAt).getTime()<=Date.now();
  return <section className="rounded border p-5 space-y-3">
    <h2 className="text-xl font-semibold">{session.studentName} · Session {session.sequence} · {session.lessonTitle}</h2>
    <p>Review earlier reports below before teaching. Submit the five-part report after this session. Corrections create a new version and preserve the original.</p>
    {!ended && <p>Reporting opens after the scheduled session ends.</p>}
    {history.error && <p role="alert">Load report history successfully before submitting.</p>}
    <fieldset disabled={submit.isPending || !ended || !["scheduled","delivered"].includes(session.status) || history.isLoading || !!history.error} className="space-y-3">
      {reportLabels.map(([key,label])=><label key={key} className="block">{label}<textarea maxLength={2000} className="mt-1 block w-full rounded border p-3" rows={3} value={fields[key]} onChange={e=>{setFields({...fields,[key]:e.target.value});setRequestId(crypto.randomUUID());}}/></label>)}
      <label className="block"><input type="checkbox" checked={delivered} onChange={e=>setDelivered(e.target.checked)}/> I delivered this teaching session and confirm this report accurately records it.</label>
      <button disabled={!delivered || Object.values(fields).some(v=>v.trim().length<10)} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50" onClick={async()=>{setMessage("");try{await submit.mutateAsync({...fields,sessionId:session.id,requestId,revisionOf:latest?.id,confirmsDelivered:true});setMessage("Session report saved.");await history.refetch();onSaved();}catch(e){setMessage(e instanceof Error?e.message:"Unable to save.");}}}>{latest?"Save report correction":"Submit session report"}</button>
    </fieldset>
    {message && <p role="status">{message}</p>}
    <EliteReports enrollmentId={session.enrollmentId}/>
  </section>;
}
