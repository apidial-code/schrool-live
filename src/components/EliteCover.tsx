import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { EliteReports, sessionDate } from "./EliteScheduleView.tsx";
const button="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50";

export function AdminEliteCovers({enrollmentId,onSaved}:{enrollmentId:number;onSaved:()=>void}) {
  const schedule=trpc.eliteScheduling.enrollmentSchedule.useQuery({enrollmentId},{retry:false,staleTime:0});
  const covers=trpc.eliteScheduling.coverAssignments.useQuery({enrollmentId},{retry:false,staleTime:0});
  const tutors=trpc.eliteScheduling.tutors.useQuery(undefined,{retry:false});
  const assign=trpc.eliteScheduling.assignCover.useMutation({retry:false});
  const cancel=trpc.eliteScheduling.cancelCover.useMutation({retry:false});
  const [sessionId,setSessionId]=useState(0),[teacherId,setTeacherId]=useState(0);
  const [reason,setReason]=useState(""),[handover,setHandover]=useState(""),[familyNotice,setFamilyNotice]=useState("");
  const [unavoidable,setUnavoidable]=useState(false),[notified,setNotified]=useState(false),[message,setMessage]=useState("");
  const [cancelReason,setCancelReason]=useState(""),[cancelNotice,setCancelNotice]=useState(false);
  const lateReview=trpc.eliteScheduling.authoriseLateCoverReview.useMutation({retry:false});
  const [lateEvidence,setLateEvidence]=useState("");
  const zone=schedule.data?.allocation?.timezone??"Australia/Sydney";
  async function refresh(){await Promise.all([covers.refetch(),schedule.refetch()]);onSaved();}
  return <section className="rounded border p-5 space-y-3"><h3 className="text-lg font-semibold">Exceptional covering tutor</h3>
    <p>The regular tutor remains responsible for the complete course. Assign cover only for an unavoidable absence, after recording the family notification and teaching handover. This changes the tutor for one booked hour; it adds no parent fee and sends no automatic message.</p>
    {covers.isLoading?<p>Loading covering records…</p>:covers.error?<p role="alert">Unable to load covering records.</p>:covers.data?.map(c=>{
      const session=schedule.data?.sessions.find(s=>s.id===c.sessionId);
      return <article key={c.id} className="rounded border p-4 space-y-2"><h4 className="font-semibold">Cover #{c.id} · Booking #{c.sessionId} · {c.coverName} · {c.status}</h4>
        <p>{session?sessionDate(session.startsAt,zone):""} · Approved by Admin account #{c.approvedBy} on {sessionDate(c.createdAt,zone)}</p>
        <p>Reason: {c.reason}</p><p className="whitespace-pre-wrap">Teaching handover: {c.handover}</p><p>Family notification: {c.familyNotice}</p>
        <p>Covering tutor acknowledgement: {c.acknowledgedAt?sessionDate(c.acknowledgedAt,zone):"Awaiting review"}</p>
        {c.returnNote && <p className="whitespace-pre-wrap">Return to regular tutor: {c.returnNote}</p>}
        {c.returnedAt && <p>Regular tutor reviewed report #{c.returnedReportId}: {sessionDate(c.returnedAt,zone)}</p>}
        {c.cancellationReason && <p>Cancellation record: {c.cancellationReason}</p>}
        {c.lateReviewReason && <p>Late handover investigation by Admin #{c.lateReviewApprovedBy}: {c.lateReviewReason}</p>}
        {c.status==="assigned" && session && +new Date(session.endsAt)<=Date.now() && !c.lateReviewApprovedBy && <details className="space-y-2"><summary>Resolve a missing or outdated handover acknowledgement</summary>
          <p>Investigate the missed acknowledgement before permitting a late review. This does not mark teaching as delivered or change any fee.</p>
          <label className="block">Investigation and evidence<textarea className="block w-full border p-2" maxLength={2000} value={lateEvidence} onChange={e=>setLateEvidence(e.target.value)}/></label>
          <button className={button} disabled={lateReview.isPending || lateEvidence.trim().length<10} onClick={async()=>{try{await lateReview.mutateAsync({coverId:c.id,evidence:lateEvidence});await refresh();setMessage("Late review authorised. The covering tutor must still acknowledge the current teaching record before reporting.");}catch(e){setMessage((e as Error).message);}}}>Authorise a recorded late handover review</button>
        </details>}
        {c.status==="assigned" && session && +new Date(session.startsAt)>Date.now() && <details className="space-y-2"><summary>Cancel this covering assignment</summary>
          <label className="block">Reason and family notification record<textarea value={cancelReason} maxLength={2000} onChange={e=>setCancelReason(e.target.value)} className="block w-full border p-2"/></label>
          <label className="block"><input type="checkbox" checked={cancelNotice} onChange={e=>setCancelNotice(e.target.checked)}/> The family has been told the regular tutor will resume this hour.</label>
          <button className={button} disabled={cancel.isPending || !cancelNotice || cancelReason.trim().length<10} onClick={async()=>{setMessage("");try{await cancel.mutateAsync({coverId:c.id,reason:cancelReason,confirmsFamilyNotified:true});await refresh();setMessage("Cover cancelled; the regular tutor's booking is restored.");}catch(e){setMessage((e as Error).message);}}}>Restore regular tutor for this hour</button>
        </details>}
      </article>;
    })}
    <details className="space-y-3"><summary>Approve a covering tutor for one hour</summary>
      <label className="block">Teaching booking<select className="ml-2 border p-2" value={sessionId} onChange={e=>setSessionId(Number(e.target.value))}><option value={0}>Choose a future booking</option>{schedule.data?.sessions.filter(s=>s.status==="scheduled" && +new Date(s.startsAt)>Date.now() && s.teacherId===schedule.data?.allocation?.teacherId).map(s=><option key={s.id} value={s.id}>Session {s.sequence} · {sessionDate(s.startsAt,zone)} · {s.lessonTitle}</option>)}</select></label>
      <label className="block">Covering tutor<select className="ml-2 border p-2" value={teacherId} onChange={e=>setTeacherId(Number(e.target.value))}><option value={0}>Choose an approved tutor</option>{tutors.data?.filter(t=>t.approved && t.commitmentAt && t.id!==schedule.data?.allocation?.teacherId).map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
      {tutors.error && <p role="alert">Unable to load tutors.</p>}
      <label className="block">Reason the regular tutor cannot attend<textarea className="block w-full border p-2" maxLength={2000} value={reason} onChange={e=>setReason(e.target.value)}/></label>
      <label className="block">Teaching handover: current understanding, where teaching stopped and this hour's objectives<textarea className="block w-full border p-2" maxLength={2000} value={handover} onChange={e=>setHandover(e.target.value)}/></label>
      <label className="block">Family notification record or correspondence reference<textarea className="block w-full border p-2" maxLength={2000} value={familyNotice} onChange={e=>setFamilyNotice(e.target.value)}/></label>
      <label className="block"><input type="checkbox" checked={unavoidable} onChange={e=>setUnavoidable(e.target.checked)}/> This is an unavoidable exception; the regular tutor retains responsibility for the course.</label>
      <label className="block"><input type="checkbox" checked={notified} onChange={e=>setNotified(e.target.checked)}/> The family has been notified of this covering tutor and the unchanged time.</label>
      <button className={button} disabled={assign.isPending || !sessionId || !teacherId || !unavoidable || !notified || [reason,handover,familyNotice].some(v=>v.trim().length<10)} onClick={async()=>{setMessage("");try{await assign.mutateAsync({sessionId,teacherId,reason,handover,familyNotice,confirmsUnavoidable:true,confirmsFamilyNotified:true});await refresh();setSessionId(0);setNotified(false);setUnavoidable(false);setMessage("Exceptional covering assignment saved. The covering tutor must review and acknowledge the handover.");}catch(e){setMessage((e as Error).message);}}}>Approve this single covering hour</button>
    </details>
    {message && <p role="status">{message}</p>}
  </section>;
}

export function CoverHandover({sessionId,enrollmentId,onSaved}:{sessionId:number;enrollmentId:number;onSaved:()=>void}) {
  const details=trpc.eliteScheduling.coverDetails.useQuery({sessionId},{retry:false,staleTime:0});
  const acknowledge=trpc.eliteScheduling.acknowledgeCover.useMutation({retry:false});
  const [reviewed,setReviewed]=useState(false),[committed,setCommitted]=useState(false),[message,setMessage]=useState("");
  const d=details.data;
  const history=trpc.eliteScheduling.reports.useQuery({enrollmentId,sessionId},{retry:false,staleTime:0});
  useEffect(()=>{setReviewed(false);setCommitted(false);},[d?.reviewKey]);
  return <section className="rounded border p-5 space-y-3"><h3 className="text-lg font-semibold">Covering session handover</h3>
    {details.isLoading?<p>Loading handover…</p>:details.error?<p role="alert">Unable to load this covering handover.</p>:d && <>
      <p>Regular tutor: {d.regularTutor}. You are responsible for this booked hour only. Review the latest earlier reports and the handover before teaching.</p>
      <p className="whitespace-pre-wrap">{d.handover}</p>
      {d.reviewOverdue && !d.lateReviewAllowed && <p role="alert">The handover acknowledgement is overdue. Contact Admin for a recorded review before submitting this report.</p>}
      <EliteReports enrollmentId={enrollmentId} sessionId={sessionId}/>
      {d.reviewCurrent?<p role="status">Current teaching record and commitment acknowledged.</p>:<>
        <label className="block"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> I have read the current lesson handover and earlier reports, including where the regular tutor left the teaching.</label>
        <label className="block"><input type="checkbox" checked={committed} onChange={e=>setCommitted(e.target.checked)}/> I accept this teaching commitment and will submit the five-part report and a return note for the regular tutor.</label>
        <button className={button} disabled={acknowledge.isPending || !reviewed || !committed || history.isFetching || !!history.error || details.isFetching || d.reviewOverdue && !d.lateReviewAllowed} onClick={async()=>{try{await acknowledge.mutateAsync({coverId:d.id,reviewKey:d.reviewKey,confirmsReviewed:true,confirmsCommitment:true});await details.refetch();onSaved();}catch(e){setMessage((e as Error).message);}}}>Acknowledge handover and covering commitment</button>
      </>}
    </>}
    {message && <p role="alert">{message}</p>}
  </section>;
}

export function CoverReturns() {
  const returns=trpc.eliteScheduling.myCoverReturns.useQuery(undefined,{retry:false,staleTime:0});
  return <section className="rounded border p-5 space-y-3"><h2 className="text-xl font-semibold">Continuity with your covering tutors</h2>
    <p>You retain responsibility for these students. Review each covering report and return note before continuing with the next teaching hour.</p>
    {returns.isLoading?<p>Loading handovers…</p>:returns.error?<p role="alert">Unable to load covering handovers.</p>:!returns.data?.length?<p>No covering handovers awaiting attention.</p>:returns.data.map(c=><ReturnReview key={c.id} cover={c} onSaved={()=>{void returns.refetch();}}/>)}
  </section>;
}
type Return={id:number;sessionId:number;enrollmentId:number;studentName:string|null;coverName:string|null;status:string;handover:string;returnNote:string|null;returnedAt:Date|string|null;startsAt:Date|string;sequence:number};
function ReturnReview({cover:c,onSaved}:{cover:Return;onSaved:()=>void}) {
  const reports=trpc.eliteScheduling.reports.useQuery({enrollmentId:c.enrollmentId},{retry:false,staleTime:0});
  const latest=reports.data?.find(r=>r.sessionId===c.sessionId);
  const acknowledge=trpc.eliteScheduling.acknowledgeCoverReturn.useMutation({retry:false});
  const [reviewed,setReviewed]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{setReviewed(false);},[latest?.id]);
  return <details className="rounded border p-4 space-y-3"><summary>{c.studentName} · Session {c.sequence} · {c.coverName} · {c.status==="assigned"?"Awaiting covering delivery":"Return report awaiting your review"}</summary>
    <p className="whitespace-pre-wrap">Original teaching handover: {c.handover}</p>
    {c.returnNote && <p className="whitespace-pre-wrap">Covering tutor's return note: {c.returnNote}</p>}
    <EliteReports enrollmentId={c.enrollmentId}/>
    {c.status==="delivered" && <>
      <label className="block"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/> I have reviewed the latest covering report and return note and am ready to continue the student's teaching.</label>
      <button className={button} disabled={!reviewed || !latest || !!reports.error || reports.isFetching || acknowledge.isPending} onClick={async()=>{try{await acknowledge.mutateAsync({coverId:c.id,reportId:latest!.id,confirmsReviewed:true});onSaved();}catch(e){setMessage((e as Error).message);}}}>Record review and continue as regular tutor</button>
    </>}
    {message && <p role="alert">{message}</p>}
  </details>;
}
