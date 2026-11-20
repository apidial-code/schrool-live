import { useState } from "react";
import { trpc } from "../lib/trpc";
export default function AdminEliteTutors() {
  const tutors=trpc.eliteScheduling.tutors.useQuery(undefined,{retry:false,staleTime:0});
  const register=trpc.eliteScheduling.registerTutor.useMutation({retry:false});
  const approve=trpc.eliteScheduling.approveTutor.useMutation({retry:false});
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[message,setMessage]=useState("");
  async function add(e:React.FormEvent) {
    e.preventDefault();setMessage("");
    try { await register.mutateAsync({name,email});setMessage("Tutor account ready. Review and approve course eligibility below. The tutor must then sign in and commit their availability.");await tutors.refetch(); } catch(e){setMessage(e instanceof Error?e.message:"Unable to save.");}
  }
  return <main className="mx-auto max-w-5xl space-y-5 p-6">
    <a href="/admin/students" className="text-blue-800 underline">Back to student files</a>
    <h1 className="text-2xl font-semibold">Elite tutor approval</h1>
    <p>Approve only tutors whose suitability for Math I Year 5/6 has been verified. Approval here does not replace qualification checks or the tutor agreement.</p>
    <form onSubmit={add} className="space-y-3 rounded border p-5"><h2 className="text-lg font-semibold">Register a tutor account</h2>
      <label className="block">Tutor name<input className="ml-3 rounded border p-2" required value={name} onChange={e=>setName(e.target.value)}/></label>
      <label className="block">Tutor email<input type="email" className="ml-3 rounded border p-2" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
      <p>Use a separate tutor email. Existing student or Admin accounts are not changed. No email is sent by this form.</p>
      <button disabled={register.isPending} className="rounded bg-[#1560B0] px-4 py-3 text-white">Register tutor</button>
    </form>
    {message && <p role="status">{message}</p>}
    {tutors.isLoading?<p>Loading tutors…</p>:tutors.error?<p role="alert">Unable to load tutors.</p>:<ul className="space-y-3">{tutors.data?.map(t=><li key={t.id} className="rounded border p-4 space-y-2">
      <p>{t.name} · {t.email} · {t.approved?"Approved":"Not approved"} · {t.commitmentAt?"Availability committed":"Awaiting tutor availability"}</p>
      <button disabled={approve.isPending} className="rounded border px-4 py-2" onClick={async()=>{setMessage("");try{await approve.mutateAsync({teacherId:t.id,approved:!t.approved});await tutors.refetch();}catch(e){setMessage(e instanceof Error?e.message:"Unable to update.");}}}>{t.approved?"Pause new allocations":"Approve for Year 5/6 Elite"}</button>
    </li>)}</ul>}
    <p>Tutors sign in with their own email and open <a href="/teacher/elite" className="text-blue-800 underline">Elite teaching</a> to commit regular hours.</p>
  </main>;
}
