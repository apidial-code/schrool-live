import AdminEliteLifecycle from "../components/AdminEliteLifecycle.tsx";
import { useEffect, useRef, useState } from "react";
import AdminStudentSupport from "../components/AdminStudentSupport";
import { trpc } from "../lib/trpc";
import { courseLevels } from "../../shared/courseProgress";

const date = (value: string | Date | number | null | undefined) => value == null ? "Not recorded" : new Date(value).toLocaleString("en-AU", { timeZone: "Australia/Sydney" });
const money = (cents: number | null, currency = "AUD") => cents == null ? "Not recorded" : new Intl.NumberFormat("en-AU", { style: "currency", currency }).format(cents / 100);
const box = "rounded-xl border border-blue-100 bg-white p-5 space-y-3";
const button = "rounded-lg bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50";
export default function AdminStudentFiles() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<number | null>(() => {
    const id = Number(new URLSearchParams(window.location.search).get("enrollmentId"));
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  });
  const list = trpc.admin.studentFiles.useQuery({ search: query, page }, { retry: false, staleTime: 0 });
  const file = trpc.admin.studentFile.useQuery({ enrollmentId: selected ?? 0 }, { enabled: selected != null, retry: false, staleTime: 0, gcTime: 0 });
  const data = file.data;
  const fileHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (selected == null) return;
    fileHeading.current?.focus({ preventScroll: true });
    fileHeading.current?.scrollIntoView({ block: "start" });
  }, [selected]);
  const openFile = (id: number) => {
    const enrollmentId = Number(id);
    if (selected === enrollmentId) {
      void file.refetch();
      fileHeading.current?.focus({ preventScroll: true });
      fileHeading.current?.scrollIntoView({ block: "start" });
    } else setSelected(enrollmentId);
  };
  return <main className="min-h-screen bg-slate-50 p-6 text-slate-900"><div className="mx-auto max-w-6xl space-y-6">
    <header><a href="/admin" className="text-blue-700 underline">Back to Admin dashboard</a><h1 className="mt-4 text-3xl font-bold">Student files</h1><p>Review enrolments, payments and learning progress. Dates use Australia/Sydney time.</p></header>
    <section className={box}><h2 className="text-xl font-semibold">Find an enrolment</h2>
      <form className="flex flex-wrap gap-3" onSubmit={e => { e.preventDefault(); setSelected(null); setPage(0); setQuery(search.trim()); }}>
        <label className="flex-1">Student name, parent email or enrolment number<input className="mt-1 block w-full rounded border p-3" value={search} maxLength={100} onChange={e => setSearch(e.target.value)} /></label><button className={button}>Search</button>
      </form>
      {list.isFetching ? <p role="status">Loading enrolments…</p> : list.error ? <p role="alert">Unable to load enrolments. <button onClick={() => list.refetch()} className="underline">Try again</button></p> : <>
        {!list.data?.rows.length && <p>No matching enrolments.</p>}
        <ul className="divide-y">{list.data?.rows.map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><button type="button" className="font-semibold text-blue-800 underline" onClick={() => openFile(row.id)}>{row.studentName || "Student name not recorded"}</button><p>#{row.id} · {row.yearLevel} · {row.tier} · {row.status} · Payment: {row.paymentStatus}</p></div><button className={button} onClick={() => openFile(row.id)}>Open file #{row.id}</button></li>)}</ul>
        <nav className="flex items-center gap-4" aria-label="Enrolment pages"><button className={button} disabled={!page} onClick={() => { setSelected(null); setPage(page-1); }}>Previous</button><span>Page {page+1}</span><button className={button} disabled={!list.data?.hasMore} onClick={() => { setSelected(null); setPage(page+1); }}>Next</button></nav>
      </>}
    </section>
    {selected != null && <section className="space-y-5" aria-label={`Enrolment ${selected}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 ref={fileHeading} tabIndex={-1} className="scroll-mt-4 text-2xl font-bold">Student file · Enrolment #{selected}</h2><button className={button} disabled={file.isFetching} onClick={() => file.refetch()}>Refresh file</button></div>
      {file.isFetching ? <p role="status">Loading student file…</p> : file.error ? <p role="alert">Unable to load this student file. Please try Refresh file.</p> : data && <>
        <section className={box}><h3 className="text-xl font-semibold">Student and family</h3>
          <p><strong>Student:</strong> {data.family?.studentName ?? data.enrollment.studentName ?? "Not recorded"}</p><p><strong>Student email:</strong> {data.family?.studentEmail ?? "Not recorded"}</p><p><strong>Age at enrolment:</strong> {data.family?.studentAge ?? "Not recorded"}</p>
          <p><strong>Parent or guardian:</strong> {data.family?.parentName ?? "Not recorded"}</p><p><strong>Parent email:</strong> {data.family?.parentEmail ?? data.enrollment.parentEmail ?? "Not recorded"}</p><p><strong>Phone:</strong> {data.family?.phone ?? "Not recorded"}</p><p>Consultant ID: {data.enrollment.consultantId ?? "Not recorded"}</p>
          {!data.snapshotAvailable && <p>Saved agreement details are unavailable for this record. Missing information is not inferred.</p>}
        </section>
        <section className={box}><h3 className="text-xl font-semibold">Enrolment and access</h3><p>{data.courseName ?? data.enrollment.yearLevel} · {data.enrollment.tier}</p><p>Status: {data.enrollment.status} · Payment: {data.enrollment.paymentStatus}</p><p>Draft saved: {date(data.draftSavedAt)}</p><p>Enrolment date: {date(data.enrollment.enrolledAt ?? data.enrollment.activatedAt)}</p>{!data.enrollment.enrolledAt && data.enrollment.activatedAt && <p className="text-sm">Enrolment date shown from the recorded access activation.</p>}<p>Agreement accepted: {date(data.enrollment.acceptedAt)}</p><p>Access activated: {date(data.enrollment.activatedAt)}</p><p>Access ends: {data.enrollment.tier === "elite" && !data.enrollment.accessEndsAt ? "On confirmed course completion" : date(data.enrollment.accessEndsAt)}</p></section>
        {data.enrollment.tier === "standard" && <section className={box}><h3 className="text-xl font-semibold">Standard phone support</h3><p>Up to 30 minutes each week during the first three months. Unused minutes do not carry forward.</p><p>The student learns independently through their student dashboard. Parents can request a progress report from Admin.</p><p>Record calls and follow-up notes in the Admin notes section below.</p></section>}
        {data.enrollment.tier === "elite" && <AdminEliteLifecycle key={`elite-${selected}`} enrollmentId={selected} status={data.enrollment.status} hasExpiry={!!data.enrollment.accessEndsAt} onSaved={() => { void file.refetch(); void list.refetch(); }} />}
        <AdminStudentSupport key={selected} enrollmentId={selected} standard={data.enrollment.tier === "standard"} />
        <section className={box}><h3 className="text-xl font-semibold">Payments</h3><p>Agreed total: {money(data.enrollment.agreedTotalCents, data.enrollment.currency)} · Plan: {data.enrollment.paymentPlan ?? "Not recorded"}</p>
          <div className="overflow-x-auto"><table className="w-full text-left"><caption className="text-left">Recorded payment attempts</caption><thead><tr>{["Recorded", "Amount", "Status", "Mode"].map(t => <th className="p-2" key={t}>{t}</th>)}</tr></thead><tbody>{data.payments.map(p => <tr key={p.id}><td className="p-2">{date(p.paidAt ?? p.createdAt)}</td><td className="p-2">{money(p.amountCents,p.currency)}</td><td className="p-2">{p.status}</td><td className="p-2">{p.livemode ? "Live" : "Test"}</td></tr>)}</tbody></table></div>{!data.payments.length && <p>No payment attempts recorded.</p>}
          {!!data.schedule.length && <><h4 className="font-semibold">Accepted payment schedule</h4><ul>{data.schedule.map((p,i) => <li key={i}>{p.monthOffset === 0 ? "At checkout" : `${p.monthOffset} calendar month(s) after initial payment`}: {money(p.amountCents)}</li>)}</ul></>}
        </section>
        <section className={box}><h3 className="text-xl font-semibold">Learning progress</h3><p>{data.progress.filter(l => l.completed).length} of {data.progress.length} lessons passed at all three difficulties.</p>{data.enrollment.tier === "elite" && <p>Exercise progress only. Tutor approval, Zoom sessions and 5QHackMath requirements are separate.</p>}<p>Last exercise activity: {date(data.lastActivity)}</p><p>Best valid scores exclude questions whose solutions were opened before submission.</p>
          <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th className="p-2">Lesson</th>{courseLevels.map(level => <th className="p-2 capitalize" key={level}>{level}</th>)}</tr></thead><tbody>{data.progress.map(l => <tr className="border-t" key={l.id}><th scope="row" className="p-2 font-normal">{l.title}{l.completed && " · Passed"}</th>{courseLevels.map(level => <td className="p-2" key={level}>{l.levels[level].bestScore == null ? "No submitted score" : `${l.levels[level].bestScore}/10`}<br />{l.levels[level].attempts} submitted{l.levels[level].active && " · Attempt saved"}</td>)}</tr>)}</tbody></table></div>
        </section>
      </>}
    </section>}
  </div></main>;
}
