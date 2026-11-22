import { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { emptyWork, photoLimit, submittedWork, type QuestionWork } from "../../shared/fiveQuestions";

const box="mt-5 space-y-3 rounded border p-5";
const button="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50";
type Input={enrollmentId:number;lessonId:number};
const queryOptions={retry:false,staleTime:0,gcTime:0,refetchOnWindowFocus:false} as const;
function errorText(e:unknown){return e instanceof Error?e.message:"Unable to save. Try again.";}

async function preparePhoto(file:File) {
  if(!["image/jpeg","image/png","image/webp"].includes(file.type) || file.size>12000000)
    throw new Error("Choose a JPEG, PNG or WebP photo smaller than 12 MB.");
  const bitmap=await createImageBitmap(file);
  try {
    const scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height));
    const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
    const context=canvas.getContext("2d");if(!context)throw new Error("Unable to prepare photo.");
    context.fillStyle="white";context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(bitmap,0,0,canvas.width,canvas.height);
    for(const quality of [0.85,0.7,0.55,0.4]) {
      const photo=canvas.toDataURL("image/jpeg",quality);if(photo.length<=photoLimit)return photo;
    }
    throw new Error("This photo is too detailed. Crop to one question and its working, then try again.");
  } finally {bitmap.close();}
}
function WorkView({input,submissionId}:{input:Input;submissionId:number}) {
  const work=trpc.fiveQuestions.submission.useQuery({...input,submissionId},queryOptions);
  if(work.isLoading)return <p>Loading saved work…</p>;
  if(work.error)return <p role="alert">{work.error.message}</p>;
  return <ol className="space-y-4">{work.data?.map((q,i)=><li className="rounded border p-3" key={i}>
    <h4 className="font-semibold">Question {i+1}</h4>
    {q.question&&<p className="whitespace-pre-wrap">{q.question}</p>}
    {q.answer&&<><h5 className="mt-2 font-semibold">Worked answer</h5><p className="whitespace-pre-wrap">{q.answer}</p></>}
    {q.photo&&<img className="mt-2 max-h-[900px] max-w-full object-contain" src={q.photo} alt={`Handwritten question ${i+1} and worked answer`}/>}
  </li>)}</ol>;
}
function Review({input,submissionId,onSaved}:{input:Input;submissionId:number;onSaved:()=>void}) {
  const ready=trpc.fiveQuestions.requirements.useQuery(input,queryOptions);
  const review=trpc.fiveQuestions.review.useMutation({retry:false});
  const [feedback,setFeedback]=useState(""),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState("");
  const canApprove=ready.data?.exercises&&ready.data.teaching&&ready.data.returns;
  async function save(decision:"approved"|"revise") {
    setMessage("");try{await review.mutateAsync({...input,submissionId,decision,feedback,confirmsReviewed:true});onSaved();}
    catch(e){setMessage(errorText(e));void ready.refetch();}
  }
  return <fieldset disabled={review.isPending} className="mt-4 space-y-3">
    <p>Approval requires passes at all three difficulties, two delivered teaching hours with reports, and completed covering handovers.</p>
    {ready.data&&<p>Exercise passes: {ready.data.exercises?"ready":"pending"} · Teaching hours: {ready.data.teaching?"ready":"pending"} · Covering handovers: {ready.data.returns?"ready":"pending"}</p>}
    <button className="underline" onClick={()=>ready.refetch()}>Refresh approval requirements</button>
    {ready.error&&<p role="alert">{ready.error.message}</p>}
    <label className="block">Feedback on these five questions<textarea className="block w-full rounded border p-3" maxLength={3000} rows={4} value={feedback} onChange={e=>setFeedback(e.target.value)}/></label>
    <label className="block"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I have reviewed all five questions and worked answers. This feedback records my decision.</label>
    <div className="flex flex-wrap gap-3">
      <button className={button} disabled={!confirmed||feedback.trim().length<10} onClick={()=>save("revise")}>Return for revision</button>
      <button className={button} disabled={!confirmed||feedback.trim().length<10||!canApprove||ready.isFetching} onClick={()=>save("approved")}>Approve lesson and progression</button>
    </div>
    <p className="text-sm">Decisions are retained. Return work for revision when further work is needed; a new student submission preserves this version and your feedback.</p>
    {message&&<p role="alert">{message}</p>}
  </fieldset>;
}
export function FiveQuestionHistory({input,review=false,onReviewed}:{input:Input;review?:boolean;onReviewed?:()=>void}) {
  const [page,setPage]=useState(0),[selected,setSelected]=useState<number|null>(null);
  const history=trpc.fiveQuestions.history.useQuery({...input,page},queryOptions);
  return <section className={box}><h3 className="text-lg font-semibold">Five-question submission history</h3>
    {history.isLoading?<p>Loading submission history…</p>:history.error?<p role="alert">{history.error.message}</p>:!history.data?.rows.length?<p>No five-question submissions yet.</p>:history.data.rows.map((s,index)=><section className="rounded border p-3" key={s.id}>
      <button className="text-left text-blue-800 underline" aria-expanded={selected===s.id} onClick={()=>setSelected(selected===s.id?null:s.id)}>Submission #{s.id} · {new Date(s.createdAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"})} · {s.decision==="approved"?"Approved":s.decision==="revise"?"Revision requested":"Awaiting tutor review"}</button>
      {s.feedback&&<div className="mt-3"><p className="font-semibold">Tutor feedback · {s.author} · {s.reviewedAt?new Date(s.reviewedAt).toLocaleString("en-AU",{timeZone:"Australia/Sydney"}):""}</p><p className="whitespace-pre-wrap">{s.feedback}</p></div>}
      {selected===s.id&&<div className="mt-3"><WorkView input={input} submissionId={s.id}/>
        {review&&page===0&&index===0&&!s.decision&&<Review input={input} submissionId={s.id} onSaved={()=>{void history.refetch();onReviewed?.();}}/>}</div>}
    </section>)}
    <nav className="flex gap-4" aria-label="Five-question submission pages"><button disabled={!page||history.isFetching} onClick={()=>{setSelected(null);setPage(page-1);}}>Newer</button><span>Page {page+1}</span><button disabled={!history.data?.hasMore||history.isFetching} onClick={()=>{setSelected(null);setPage(page+1);}}>Older</button><button className="underline" disabled={history.isFetching} onClick={()=>history.refetch()}>Refresh history</button></nav>
  </section>;
}
export function StudentFiveQuestions({input}:{input:Input}) {
  const draft=trpc.fiveQuestions.draft.useQuery(input,queryOptions);
  const save=trpc.fiveQuestions.saveDraft.useMutation({retry:false}),submit=trpc.fiveQuestions.submit.useMutation({retry:false});
  const [work,setWork]=useState<QuestionWork[]>(emptyWork),[version,setVersion]=useState(0),[dirty,setDirty]=useState(false);
  const [confirmed,setConfirmed]=useState(false),[message,setMessage]=useState(""),[photoBusy,setPhotoBusy]=useState(false);
  const [requestId,setRequestId]=useState(()=>crypto.randomUUID()),[historyKey,setHistoryKey]=useState(0);
  useEffect(()=>{if(draft.data&&!dirty&&draft.data.version>=version){setWork(draft.data.work);setVersion(draft.data.version);}},[draft.data,dirty,version]);
  useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
  function edit(index:number,changes:Partial<QuestionWork>){setWork(old=>old.map((q,i)=>i===index?{...q,...changes}:q));setDirty(true);setConfirmed(false);setMessage("");}
  const latest=draft.data?.latest,editable=!latest||latest.decision==="revise";
  const busy=photoBusy||save.isPending||submit.isPending||draft.isFetching;
  return <section className={box}><h2 className="text-xl font-semibold">Your five questions and worked answers</h2>
    <p>Create five questions about this lesson and show how to solve each one. Type your work, add a clear photo for each question, or combine both. Each photo must include that question and its full working.</p>
    {draft.isLoading?<p>Loading saved draft…</p>:draft.error?<p role="alert">{draft.error.message}</p>:<>
      {latest&&<p>{latest.decision==="approved"?"Your regular tutor has approved this lesson.":latest.decision==="revise"?"Your tutor has requested a revision. Edit the saved work below and submit a new version.":"Your work is awaiting tutor review. You can keep practising this lesson."}</p>}
      {editable&&<fieldset disabled={busy} className="space-y-4">
        {work.map((q,i)=><div className="space-y-2 rounded border p-3" key={i}><h3 className="font-semibold">Question {i+1}</h3>
          <label className="block">Your question<textarea className="block w-full rounded border p-2" maxLength={2000} rows={2} value={q.question} onChange={e=>edit(i,{question:e.target.value})}/></label>
          <label className="block">Your worked answer<textarea className="block w-full rounded border p-2" maxLength={4000} rows={4} value={q.answer} onChange={e=>edit(i,{answer:e.target.value})}/></label>
          <label className="block">Photo of this question and worked answer<input className="block" type="file" accept="image/jpeg,image/png,image/webp" onChange={async e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;setPhotoBusy(true);setMessage("");try{edit(i,{photo:await preparePhoto(file)});}catch(err){setMessage(errorText(err));}finally{setPhotoBusy(false);}}}/></label>
          {q.photo&&<><img className="max-h-96 max-w-full object-contain" src={q.photo} alt={`Draft handwritten question ${i+1}`}/><button className="underline" onClick={()=>edit(i,{photo:null})}>Remove photo {i+1}</button></>}
        </div>)}
        <p>Photos are resized before saving. Check that every question and worked answer is readable. Drafts are saved when you press Save draft.</p>
        <button className={button} disabled={!dirty} onClick={async()=>{setMessage("");try{const result=await save.mutateAsync({...input,version,work});setVersion(result.version);setDirty(false);await draft.refetch();setMessage("Draft saved.");}catch(e){setMessage(errorText(e));}}}>Save draft</button>
        <label className="block"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> These are my five questions and worked answers, ready for my tutor to review.</label>
        <button className={button} disabled={dirty||!version||!confirmed||!submittedWork.safeParse(work).success} onClick={async()=>{setMessage("");try{await submit.mutateAsync({...input,version,requestId,confirmsOwnWork:true});setConfirmed(false);setRequestId(crypto.randomUUID());await draft.refetch();setHistoryKey(k=>k+1);setMessage("Five-question submission saved. Your tutor can now review it.");}catch(e){setMessage(errorText(e));}}}>Submit five questions</button>
        {dirty&&<p>Save your changes before submitting.</p>}
      </fieldset>}
      <button disabled={busy} className="underline" onClick={()=>{setDirty(false);setConfirmed(false);void draft.refetch();setHistoryKey(k=>k+1);}}>{dirty?"Reload saved draft (discard unsaved changes)":"Refresh saved work and feedback"}</button>
    </>}
    {photoBusy&&<p role="status">Preparing photo…</p>}{message&&<p role="status">{message}</p>}
    <FiveQuestionHistory key={historyKey} input={input}/>
  </section>;
}
export function FiveQuestionRecords({enrollmentId,review=false}:{enrollmentId:number;review?:boolean}) {
  const course=trpc.fiveQuestions.course.useQuery({enrollmentId},queryOptions);
  const [selected,setSelected]=useState(0);
  const lessonId=selected||course.data?.[0]?.id;
  return <section className={box}><h2 className="text-xl font-semibold">Five-question work and tutor approval</h2>
    {course.isLoading?<p>Loading lessons…</p>:course.error?<p role="alert">{course.error.message}</p>:<>
      <label>Lesson<select className="ml-2 max-w-full rounded border p-2" value={lessonId??""} onChange={e=>setSelected(Number(e.target.value))}>{course.data?.map((l,i)=><option key={l.id} value={l.id}>{i+1}. {l.title} · {l.approved?"Approved":"Not yet approved"}</option>)}</select></label>
      {lessonId&&<FiveQuestionHistory key={lessonId} input={{enrollmentId,lessonId}} review={review} onReviewed={()=>{void course.refetch();}}/>}
    </>}
  </section>;
}
export function TutorFiveQuestions() {
  const students=trpc.fiveQuestions.myStudents.useQuery(undefined,queryOptions);
  const [selected,setSelected]=useState(0),enrollmentId=selected||students.data?.[0]?.enrollmentId;
  return <section className={box}><h2 className="text-xl font-semibold">My students' five-question reviews</h2>
    <p>The regular tutor reviews and approves lesson progression. Covering tutors record their teaching report and return handover separately.</p>
    {students.isLoading?<p>Loading allocated students…</p>:students.error?<p role="alert">{students.error.message}</p>:!students.data?.length?<p>No active students allocated.</p>:<>
      <label>Student<select className="ml-2 max-w-full rounded border p-2" value={enrollmentId??""} onChange={e=>setSelected(Number(e.target.value))}>{students.data.map(s=><option key={s.enrollmentId} value={s.enrollmentId}>{s.studentName} · Enrolment #{s.enrollmentId}</option>)}</select></label>
      {enrollmentId&&<FiveQuestionRecords key={enrollmentId} enrollmentId={enrollmentId} review/>}
    </>}
  </section>;
}
