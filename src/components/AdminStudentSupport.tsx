import { useState } from "react";
import { trpc } from "../lib/trpc";
import { sydneyDate } from "../../shared/standardSupport";
const button = "rounded-lg bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50";
export default function AdminStudentSupport({ enrollmentId, standard }: { enrollmentId: number; standard: boolean }) {
  const [kind,setKind] = useState<"note"|"call">("note");
  const [date,setDate] = useState(() => sydneyDate(new Date()));
  const [minutes,setMinutes] = useState(10);
  const [content,setContent] = useState("");
  const [page,setPage] = useState(0);
  const [requestId,setRequestId] = useState(() => crypto.randomUUID());
  const [message,setMessage] = useState("");
  const history = trpc.admin.support.history.useQuery({enrollmentId,date,page}, {retry:false,staleTime:0,gcTime:0});
  const save = trpc.admin.support.record.useMutation();
  const changed = () => {setRequestId(crypto.randomUUID());setMessage("");save.reset();};
  const data = history.data;
  return <section className="rounded-xl border border-blue-100 bg-white p-5 space-y-4">
    <h3 className="text-xl font-semibold">Admin notes and support calls</h3>
    <p>Internal records for this enrolment. Entries are retained with their author and recording time. Add a correction as a new note.</p>
    {history.isFetching ? <p role="status">Loading support records…</p> : history.error ? <p role="alert">Support records are unavailable. <button className="underline" onClick={() => history.refetch()}>Try again</button></p> : data && <>
      <form className="space-y-4" onSubmit={async e => {
        e.preventDefault();setMessage("");
        try {
          await save.mutateAsync({enrollmentId,requestId,kind,date,minutes:kind === "call" ? minutes : 0,content});
          setContent("");setRequestId(crypto.randomUUID());setMessage("Entry saved.");setPage(0);void history.refetch();
        } catch { /* Mutation message shown below; retry retains the same request ID. */ }
      }}>
        <label className="block">Record type<select className="ml-3 rounded border p-2" value={kind} disabled={save.isPending} onChange={e => {changed();setKind(e.target.value as "note"|"call");}}><option value="note">Follow-up note</option>{standard && <option value="call">Phone-support call</option>}</select></label>
        <label className="block">Date (Australia/Sydney)<input type="date" required max={data.today} value={date} disabled={save.isPending} className="ml-3 rounded border p-2" onChange={e => {if(e.target.value){changed();setDate(e.target.value);}}} /></label>
        {standard && <div className="rounded bg-blue-50 p-4">
          <p>30 minutes per week for the first three months. No carry-over.</p>
          <p>Weeks are seven-day blocks from the activation date in Sydney. Support ends at the start of the three-month anniversary date.</p>
          {data.window ? <><p>Support period: {data.window.start} to {data.window.end} (end date excluded).</p>{data.window.weekStart ? <p>Selected week {data.window.week}: {data.window.weekStart} to {data.window.weekEnd} (end date excluded). Used: {data.used} minutes. Remaining: {data.remaining} minutes.</p> : <p>The selected date is outside the support period.</p>}</> : <p>No activated Standard support period is recorded.</p>}
        </div>}
        {kind === "call" && <><label className="block">Call duration (minutes)<input type="number" min={1} max={30} required disabled={save.isPending} className="ml-3 rounded border p-2" value={minutes} onChange={e => {changed();setMinutes(Number(e.target.value));}} /></label>{!data.canRecordCall && <p>A call cannot be recorded for this date or the weekly allowance is exhausted.</p>}</>}
        <label className="block">{kind === "call" ? "Call summary" : "Follow-up note"}<textarea required maxLength={4000} rows={4} className="mt-2 block w-full rounded border p-3" value={content} disabled={save.isPending} onChange={e => {changed();setContent(e.target.value);}} /></label>
        <button className={button} disabled={save.isPending || (kind === "call" && (!data.canRecordCall || minutes>data.remaining))}>{save.isPending ? "Saving…" : "Save entry"}</button>
      </form>
      {save.error && <p role="alert">{save.error.message}</p>}{message && <p role="status">{message}</p>}
      <h4 className="font-semibold">Saved history</h4>{!data.entries.length && <p>No entries recorded.</p>}
      <ol className="space-y-3">{data.entries.map(entry => <li key={entry.id} className="rounded border p-4"><strong>{entry.kind === "call" ? `Phone call · ${entry.minutes} minutes` : "Follow-up note"}</strong><p>Date: {entry.entryDate}</p><p className="whitespace-pre-wrap break-words">{entry.content}</p><p className="text-sm">Recorded by {entry.authorName || `Admin #${entry.authorId}`} · {new Date(entry.createdAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"})} · Entry #{entry.id}</p></li>)}</ol>
      <nav className="flex items-center gap-4" aria-label="Support history pages"><button className={button} disabled={!page || save.isPending} onClick={() => setPage(page-1)}>Newer</button><span>Page {page+1}</span><button className={button} disabled={!data.hasMore || save.isPending} onClick={() => setPage(page+1)}>Older</button></nav>
    </>}
  </section>;
}
