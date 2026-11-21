import { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";
import { wallTime } from "../../shared/eliteSchedule";
import { sessionDate } from "./EliteScheduleView.tsx";

const button="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50";
export function MissedSession({session,onSaved}:{session:{id:number;status:string;endsAt:Date|string};onSaved:()=>void}) {
  const mutation=trpc.eliteScheduling.recordMissed.useMutation({retry:false});
  const [reason,setReason]=useState<"illness"|"school"|"family"|"no_show"|"bereavement"|"accident"|"hospitalisation">("illness");
  const [note,setNote]=useState(""),[waiting,setWaiting]=useState(false),[early,setEarly]=useState(false),[message,setMessage]=useState("");
  if(session.status!=="scheduled" || +new Date(session.endsAt)>Date.now()) return null;
  return <details className="rounded border p-4 space-y-3"><summary>Record a missed session</summary>
    <p>The reserved hour counts as used and the tutor remains payable. A replacement needs parent approval. Ordinary illness, school and family obligations incur an additional $80 after the replacement is delivered.</p>
    <label className="block">Reason <select value={reason} onChange={e=>setReason(e.target.value as typeof reason)}>
      {["illness","school","family","no_show","bereavement","accident","hospitalisation"].map(r=><option key={r} value={r}>{r.replaceAll("_"," ")}</option>)}
    </select></label>
    <label className="block">Session record and parent correspondence<textarea className="block w-full border p-2" maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
    <label className="block"><input type="checkbox" checked={early} onChange={e=>setEarly(e.target.checked)}/> Parent expressly authorised departure before the scheduled end.</label>
    <label className="block"><input type="checkbox" checked={waiting} onChange={e=>setWaiting(e.target.checked)}/> I was present and available until the scheduled end, or until the parent expressly authorised earlier departure.</label>
    <button className={button} disabled={!waiting || note.trim().length<10 || mutation.isPending} onClick={async()=>{try{await mutation.mutateAsync({sessionId:session.id,reason,note,confirmsWaiting:true,parentAuthorisedEarlyDeparture:early});onSaved();}catch(e){setMessage((e as Error).message);}}}>Record missed hour</button>
    {message && <p role="alert">{message}</p>}
  </details>;
}

export function ReplacementCases({enrollmentId,admin=false,onSaved}:{enrollmentId:number;admin?:boolean;onSaved?:()=>void}) {
  const cases=trpc.eliteScheduling.replacementCases.useQuery({enrollmentId},{retry:false,staleTime:0});
  const schedule=trpc.eliteScheduling.enrollmentSchedule.useQuery({enrollmentId},{retry:false,staleTime:0});
  const propose=trpc.eliteScheduling.proposeReplacement.useMutation({retry:false});
  const review=trpc.eliteScheduling.reviewReplacement.useMutation({retry:false});
  const billing=trpc.eliteScheduling.replacementBilling.useMutation({retry:false});
  const [mode,setMode]=useState<"extra"|"next_regular">("extra"),[day,setDay]=useState(""),[time,setTime]=useState("17:00");
  const [timezone,setTimezone]=useState("Australia/Sydney"),[message,setMessage]=useState(""),[reference,setReference]=useState("");
  const [evidence,setEvidence]=useState(""),[funding,setFunding]=useState<"parent"|"internal_reserve">("parent");
  const zone=schedule.data?.allocation?.timezone??"Australia/Sydney";
  async function refresh(){await cases.refetch();onSaved?.();}
  return <section className="rounded border p-5 space-y-3"><h3 className="text-lg font-semibold">Missed sessions and replacements</h3>
    {cases.isLoading?<p>Loading replacement records…</p>:cases.error?<p role="alert">Unable to load replacement records.</p>:!cases.data?.length?<p>No missed-session records.</p>:cases.data.map(r=><article className="rounded border p-4 space-y-3" key={r.id}>
      <h4 className="font-semibold">Case #{r.id} · Missed booking #{r.originalId} · {r.status.replaceAll("_"," ")}</h4>
      <p>{r.reason.replaceAll("_"," ")}: {r.note}</p>
      <p>Parent replacement fee: ${(r.feeCents/100).toFixed(2)} · Billing: {r.billingStatus.replaceAll("_"," ")}{r.billingReference?" · "+r.billingReference:""}</p>
      {r.replacementId && <p>Replacement booking #{r.replacementId}{r.approvedAt?" · Approved by "+r.parentName+" on "+sessionDate(r.approvedAt,zone):""}</p>}
      {r.plan && <details><summary>Proposed lesson changes and additional hour</summary>
        <p>{r.plan.mode==="next_regular"?"Use the next regular hour for catch-up and move the remaining lesson assignments forward.":"Additional catch-up hour before the next booked session."}</p>
        {r.plan.changes.map(c=><p key={c.id}>Booking #{c.id}: lesson {c.previousLessonId} → lesson {c.lessonId}</p>)}
        {r.plan.additions.map(a=><p key={a.sequence}>Additional booking #{a.sequence}: {sessionDate(a.startsAt,zone)} · lesson {a.lessonId}</p>)}
      </details>}
      {admin && r.status==="admin_review" && <>
        <p>Exceptional circumstances require an Admin decision. Ordinary sickness, school and family obligations do not qualify for the two internal reserve hours.</p>
        <label className="block">Decision <select value={funding} onChange={e=>setFunding(e.target.value as typeof funding)}><option value="parent">Paid replacement ($80)</option><option value="internal_reserve">Authorise exceptional internal reserve hour</option></select></label>
        <label className="block">Review evidence<textarea value={evidence} maxLength={2000} onChange={e=>setEvidence(e.target.value)} className="block w-full border p-2"/></label>
        <button className={button} disabled={review.isPending || evidence.trim().length<10} onClick={async()=>{try{await review.mutateAsync({replacementId:r.id,funding,evidence});await refresh();}catch(e){setMessage((e as Error).message);}}}>Record Admin decision</button>
      </>}
      {!admin && ["awaiting_plan","proposed"].includes(r.status) && <>
        <label className="block">Catch-up arrangement <select value={mode} onChange={e=>setMode(e.target.value as typeof mode)}><option value="extra">Extra hour before the next booked session</option><option value="next_regular">Catch up at the next regular hour; shift later lessons</option></select></label>
        <p>{mode==="extra"?"Choose the extra hour within two weeks of the missed session and before the next booked hour.":"The next booked hour must be within two weeks. Choose an additional final hour after the existing course ends so no teaching is lost."} The additional hour must fit your saved availability.</p>
        <label className="block">Time zone <input className="border p-2" value={timezone} onChange={e=>setTimezone(e.target.value)}/></label>
        <label className="block">{mode==="extra"?"Extra catch-up date":"Additional final teaching date"} <input type="date" value={day} onChange={e=>setDay(e.target.value)} className="border p-2"/></label>
        <label className="block">Start time <input type="time" step="1800" value={time} onChange={e=>setTime(e.target.value)} className="border p-2"/></label>
        <button className={button} disabled={propose.isPending || !day} onClick={async()=>{setMessage("");try{const [h,m]=time.split(":").map(Number);await propose.mutateAsync({replacementId:r.id,mode,extraAt:wallTime(day,h*60+m,timezone).toISOString()});await refresh();}catch(e){setMessage((e as Error).message);}}}>Create parent approval link</button>
        {propose.data && propose.variables?.replacementId===r.id && <label className="block">Share this private link only with the parent. It expires in seven days. <input readOnly value={propose.data.url} className="block w-full border p-2" onFocus={e=>e.target.select()}/></label>}
        <p>Creating a new proposal replaces any previous approval link. Time is reserved only after parent confirmation.</p>
      </>}
      {admin && r.status==="delivered" && r.feeCents===8000 && r.billingStatus!=="paid" && <>
        <p>Admin action: collect the agreed $80 using an authorised payment method or issue a seven-day invoice. These buttons record an external invoice or payment; they do not collect funds.</p>
        <label className="block">Invoice or payment reference<input className="border p-2" value={reference} maxLength={255} onChange={e=>setReference(e.target.value)}/></label>
        {(["invoiced","paid"] as const).filter(status=>status!==r.billingStatus).map(status=><button key={status} className={button+" mr-2"} disabled={billing.isPending || reference.trim().length<3} onClick={async()=>{try{await billing.mutateAsync({replacementId:r.id,status,reference});await refresh();}catch(e){setMessage((e as Error).message);}}}>Record {status==="paid"?"payment":"seven-day invoice"}</button>)}
      </>}
    </article>)}
    {message && <p role="alert">{message}</p>}
  </section>;
}

export function FamilyReplacementApproval() {
  const [key]=useState(()=>{const p=new URLSearchParams(window.location.hash.slice(1));return {replacementId:Number(p.get("replacementId")),token:p.get("token")??""};});
  const details=trpc.eliteScheduling.replacementDetails.useMutation({retry:false});
  const approve=trpc.eliteScheduling.approveReplacement.useMutation({retry:false});
  const once=useRef(false),[parentName,setParentName]=useState(""),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{if(!once.current){once.current=true;details.mutate(key);}},[]);
  const d=details.data,zone=d?.allocation?.timezone??"Australia/Sydney";
  const original=d?.sessions.find(s=>s.id===d.originalId);
  const title=(lessonId:number)=>d?.sessions.find(s=>s.lessonId===lessonId)?.lessonTitle??"Lesson "+lessonId;
  return <main className="mx-auto max-w-3xl p-6 space-y-4"><h1 className="text-2xl font-semibold">Elite replacement session approval</h1>
    {details.isPending?<p>Loading your private approval link…</p>:details.error?<p role="alert">{details.error.message}</p>:d && <>
      <p>Student: {d.studentName} · Tutor: {d.allocation?.tutorName} · Times use {zone}.</p>
      <p>Missed hour: {original?sessionDate(original.startsAt,zone):"booking #"+d.originalId}. The original reserved hour counts as used.</p>
      <p>Additional replacement fee: <strong>${(d.feeCents/100).toFixed(2)} AUD</strong>{d.feeCents>0?", due after the replacement is delivered. Admin will arrange authorised payment or a seven-day invoice.":". No additional parent fee for this approved arrangement."}</p>
      {d.plan && <section className="rounded border p-4 space-y-3"><h2 className="text-xl font-semibold">Review the teaching changes</h2>
        {d.plan.mode==="next_regular" && <p>The next regular session covers the missed teaching. Later lesson assignments move forward, and the additional final hour below preserves the full teaching programme.</p>}
        {d.plan.replacementId && <p>Catch-up session: {sessionDate(d.sessions.find(s=>s.id===d.plan!.replacementId)!.startsAt,zone)}</p>}
        {d.plan.additions.map(a=><p key={a.sequence}>Additional hour: {sessionDate(a.startsAt,zone)} to {sessionDate(a.endsAt,zone)} · {title(a.lessonId)}</p>)}
        {!!d.plan.changes.length && <details><summary>All changed lesson assignments ({d.plan.changes.length})</summary>{d.plan.changes.map(c=>{const s=d.sessions.find(s=>s.id===c.id);return <p key={c.id}>{s?sessionDate(s.startsAt,zone):"Booking #"+c.id}: {title(c.previousLessonId)} → {title(c.lessonId)}</p>;})}</details>}
      </section>}
      {["approved","delivered"].includes(d.status)?<p role="status">Replacement arrangement confirmed. {d.status==="delivered"?"Replacement delivered. Billing status: "+d.billingStatus:"The teaching schedule has been updated."}</p>:d.status==="proposed" && <>
        <label className="block">Parent or guardian name<input value={parentName} maxLength={255} onChange={e=>setParentName(e.target.value)} className="ml-2 border p-2"/></label>
        <label className="block"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I approve the catch-up arrangement, all changed lesson assignments, the additional teaching hour and the fee shown above.</label>
        <button className={button} disabled={approve.isPending || !confirmed || parentName.trim().length<2} onClick={async()=>{try{await approve.mutateAsync({...key,parentName,confirmsTimesAndFee:true});await details.mutateAsync(key);}catch(e){setMessage((e as Error).message);}}}>Confirm replacement arrangement</button>
      </>}
    </>}
    {message && <p role="alert">{message}</p>}
  </main>;
}
