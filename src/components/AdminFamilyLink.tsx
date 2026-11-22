import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
export default function AdminFamilyLink({enrollmentId,onSaved}:{enrollmentId:number;onSaved:()=>void}) {
  const record=trpc.admin.familyLinks.get.useQuery({enrollmentId},{retry:false,staleTime:0});
  const save=trpc.admin.familyLinks.save.useMutation({retry:false});
  const [name,setName]=useState(""),[email,setEmail]=useState(""),[evidence,setEvidence]=useState(""),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState("");
  const d=record.data;
  useEffect(()=>{setEmail(d?.parentEmail??"");setName(d?.parent?.name??"");setEvidence("");setConfirmed(false);},[d?.parentId,d?.parentEmail]);
  async function submit(action:"link"|"unlink") {
    if(!d)return;setMessage("");
    try{const result=await save.mutateAsync({enrollmentId,action,parentName:name,parentEmail:email,evidence,confirmsVerified:true,expectedParentId:d.parentId??null});
      await record.refetch();onSaved();setEvidence("");setConfirmed(false);setMessage(result.linked?"Verified parent access saved. No email was sent. The parent can sign in using this email.":"Parent access removed for this enrolment.");
    }catch(e){setMessage((e as Error).message);await record.refetch();}
  }
  const disabled=save.isPending || record.isFetching || !!record.error || !d || !confirmed || evidence.trim().length<20 || name.trim().length<2 || !email.includes("@");
  return <section className="rounded-xl border border-blue-100 bg-white p-5 space-y-3"><h3 className="text-xl font-semibold">Verified parent access</h3>
    <p>Verify the guardian's identity and authority before linking. Access applies to this enrolment only. No sign-in email is sent by this form.</p>
    {record.isLoading?<p>Loading family link…</p>:record.error?<p role="alert">Unable to load family link. <button onClick={()=>record.refetch()}>Retry</button></p>:d && <>
      <p>{d.parent?`Linked account: ${d.parent.name??"Parent"} · ${d.parent.email} · ${d.parent.accountStatus}`:"No parent account linked to this enrolment."}</p>
      {d.parent && <p>Relationship: {d.link?.status??"Not verified"}</p>}
      <label className="block">Parent or guardian name<input className="block rounded border p-2" value={name} maxLength={255} onChange={e=>setName(e.target.value)}/></label>
      <label className="block">Parent email recorded on the enrolment<input type="email" className="block rounded border p-2" value={email} maxLength={254} onChange={e=>setEmail(e.target.value)}/></label>
      <p>An eligible existing parent account is reused. A new parent account is created if needed. Accounts with another role are never changed.</p>
      <label className="block">Verification evidence or reason for removing access<textarea className="block w-full rounded border p-2" value={evidence} maxLength={2000} onChange={e=>setEvidence(e.target.value)}/></label>
      <label className="block"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I have verified this guardian's identity and authority, or the authority to remove their access, and recorded the evidence.</label>
      <button className="rounded bg-[#1560B0] p-3 text-white disabled:opacity-50" disabled={disabled} onClick={()=>submit("link")}>Save verified parent link</button>
      {!!d.parentId && <button className="ml-3 rounded border p-3 disabled:opacity-50" disabled={disabled} onClick={()=>submit("unlink")}>Remove access to this enrolment</button>}
    </>}
    {message && <p role="status">{message}</p>}
  </section>;
}
