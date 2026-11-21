import { trpc } from "../lib/trpc";
import { ReplacementCases } from "./EliteReplacement.tsx";
export const reportLabels = [
  ["lessonUnderstanding","1. Lesson taught and the student's understanding at the start"],
  ["nextObjectives","2. Next session's aim and objectives"],
  ["progressDifficulties","3. Progress demonstrated and difficulties remaining"],
  ["assignedWork","4. Work to complete before the next session"],
  ["tutorComments","5. Tutor's comments on the session"],
] as const;
export const sessionDate=(value:Date|string,timezone="Australia/Sydney")=>
  new Date(value).toLocaleString("en-AU",{timeZone:timezone,dateStyle:"medium",timeStyle:"short"});
export function EliteReports({enrollmentId}:{enrollmentId:number}) {
  const reports=trpc.eliteScheduling.reports.useQuery({enrollmentId},{retry:false,staleTime:0});
  return <section className="mt-4 space-y-3"><h3 className="text-lg font-semibold">Tutor session reports</h3>
    {reports.isLoading?<p>Loading reports…</p>:reports.error?<p role="alert">Unable to load reports.</p>:!reports.data?.length?<p>No reports submitted yet.</p>:reports.data.map(r=><details key={r.id} className="rounded border p-3">
      <summary>Session {r.sequence} · {r.author} · {sessionDate(r.createdAt)}{r.revisionOf? " · Correction of report #"+r.revisionOf:""} · Report #{r.id}</summary>
      {reportLabels.map(([key,label])=><div key={key} className="mt-3"><h4 className="font-semibold">{label}</h4><p className="whitespace-pre-wrap">{r[key]}</p></div>)}
    </details>)}
  </section>;
}
export default function EliteScheduleView({enrollmentId,admin=false}:{enrollmentId:number;admin?:boolean}) {
  const schedule=trpc.eliteScheduling.enrollmentSchedule.useQuery({enrollmentId},{retry:false,staleTime:0,refetchOnWindowFocus:true});
  const link=trpc.eliteScheduling.createFamilyLink.useMutation({retry:false});
  return <section className="rounded-xl border border-blue-100 bg-white p-5 space-y-3">
    <h3 className="text-xl font-semibold">Elite teaching schedule</h3>
    {schedule.isLoading?<p>Loading schedule…</p>:schedule.error?<p role="alert">Unable to load the schedule. <button className="underline" onClick={()=>schedule.refetch()}>Try again</button></p>:schedule.data?.allocation?<>
      <p>Tutor: {schedule.data.allocation.tutorName} · Time zone: {schedule.data.allocation.timezone}</p>
      <p>One committed tutor and 46 delivered teaching hours. Each lesson has two one-hour sessions. Missed bookings and approved additional hours remain in the record.</p>
      <details><summary className="cursor-pointer font-semibold">View all {schedule.data.sessions.length} teaching bookings</summary>
        <ol className="mt-3 divide-y">{schedule.data.sessions.map(s=><li key={s.id} className="py-2">{s.sequence}. {sessionDate(s.startsAt,schedule.data!.allocation!.timezone)} · {s.lessonTitle} · {s.status}</li>)}</ol>
      </details>
    </>:<p>The family has not yet confirmed a teaching schedule.</p>}
    {admin && <>
      <p><a href="/admin/tutors" className="text-blue-800 underline">Manage approved tutors</a></p>
      {!schedule.data?.allocation && <><p>Create a private link for the parent to choose and confirm two weekly times. Share it only with that family. The link expires in seven days.</p>
        <button className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50" disabled={link.isPending} onClick={()=>link.mutate({enrollmentId})}>Create family scheduling link</button>
        {link.error && <p role="alert">{link.error.message}</p>}
        {link.data && <label className="block">Private family link<input readOnly className="mt-1 block w-full rounded border p-2" value={link.data.url} onFocus={e=>e.target.select()} /></label>}
      </>}
      <ReplacementCases enrollmentId={enrollmentId} admin onSaved={()=>{void schedule.refetch();}}/>
      <EliteReports enrollmentId={enrollmentId}/>
    </>}
  </section>;
}
