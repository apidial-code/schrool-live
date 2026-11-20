import { useState } from "react";
import { trpc } from "../lib/trpc";

export default function AdminEliteLifecycle({ enrollmentId, status, hasExpiry, onSaved }:
  { enrollmentId: number; status: string; hasExpiry: boolean; onSaved: () => void }) {
  const [teaching, setTeaching] = useState(false);
  const [approval, setApproval] = useState(false);
  const [questions, setQuestions] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [message, setMessage] = useState("");
  const update = trpc.admin.eliteLifecycle.update.useMutation({ retry: false });
  async function save(complete: boolean) {
    setMessage("");
    try {
      await update.mutateAsync(complete
        ? { action: "complete", enrollmentId, teachingConfirmed: true,
          tutorApprovalConfirmed: true, questionsConfirmed: true, evidence }
        : { action: "completion_access", enrollmentId });
      setMessage(complete ? "Course completed. Learning access is closed." : "Access now ends on confirmed course completion.");
      onSaved();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save. Please try again.");
    }
  }
  return <section className="rounded-xl border border-blue-100 bg-white p-5 space-y-3">
    <h3 className="text-xl font-semibold">Elite teaching and completion</h3>
    <p>Package: 46 one-hour teaching sessions, normally two weekly across 23 teaching weeks. Course completion requires tutor approval and the Elite learning requirements.</p>
    <p>Internal only: two reserve sessions are excluded from the teaching package. They may support an optional parent–tutor–consultant discussion or an Admin-approved exceptional cancellation involving bereavement, an accident or hospitalisation. Pay the participating tutor. There is no further pursuit if the parent declines or wants time to think.</p>
    <p>Ordinary student sickness, school commitments and family obligations require paid replacements. The internal reserve is not a general catch-up entitlement.</p>
    <p className="text-sm">Tutor allocation and session accounting will be connected separately. The confirmations below require reviewed records; exercise scores alone do not establish completion.</p>
    {status === "active" && <>
      {hasExpiry && <div className="space-y-2"><p>This existing record has a calendar expiry. Apply completion-based access to remove it, retaining an audit note and the original agreement.</p>
        <button disabled={update.isPending} onClick={() => save(false)} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50">Apply completion-based access</button></div>}
      <details><summary className="cursor-pointer font-semibold">Record verified course completion</summary>
        <div className="mt-3 space-y-3">
          <p>This closes learning access immediately. All 23 lessons must also have valid passes at all three difficulties.</p>
          <label className="block"><input type="checkbox" checked={teaching} onChange={e => setTeaching(e.target.checked)} /> I have verified completion of the teaching requirements from the session records.</label>
          <label className="block"><input type="checkbox" checked={approval} onChange={e => setApproval(e.target.checked)} /> I have verified the tutor's final approval.</label>
          <label className="block"><input type="checkbox" checked={questions} onChange={e => setQuestions(e.target.checked)} /> I have verified five student-created questions with worked answers for each lesson.</label>
          <label className="block">Tutor approval and session record references<textarea className="mt-1 block w-full rounded border p-3" value={evidence} maxLength={3000} onChange={e => setEvidence(e.target.value)} /></label>
          <button disabled={update.isPending || !teaching || !approval || !questions || evidence.trim().length < 30} onClick={() => save(true)} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50">Confirm completion and close learning access</button>
        </div>
      </details>
    </>}
    {status === "completed" && <p className="font-semibold">Course completed. Learning access is closed.</p>}
    {message && <p role="status">{message}</p>}
  </section>;
}
