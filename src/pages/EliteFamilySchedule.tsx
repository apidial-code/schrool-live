import { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";
import { weekdays } from "../../shared/eliteSchedule";
import { sessionDate } from "../components/EliteScheduleView.tsx";
export default function EliteFamilySchedule() {
  const [key]=useState(()=>{const p=new URLSearchParams(window.location.hash.slice(1));return {enrollmentId:Number(p.get("enrollmentId")),token:p.get("token")??""};});
  const details=trpc.eliteScheduling.familyDetails.useMutation({retry:false});
  const check=trpc.eliteScheduling.checkTimes.useMutation({retry:false});
  const book=trpc.eliteScheduling.book.useMutation({retry:false});
  const once=useRef(false);
  const [weekStart,setWeekStart]=useState(""),[timezone,setTimezone]=useState("Australia/Sydney");
  const [day1,setDay1]=useState(2),[day2,setDay2]=useState(5),[time1,setTime1]=useState("18:00"),[time2,setTime2]=useState("18:00");
  const [parentName,setParentName]=useState(""),[confirmed,setConfirmed]=useState(false),[message,setMessage]=useState("");
  useEffect(()=>{if(once.current)return;once.current=true;details.mutate(key,{onSuccess:d=>{
    const p=d.preferences;if(p){setTimezone(p.timezone);setDay1(Math.max(0,weekdays.findIndex(v=>v===p.day1)));setDay2(Math.max(0,weekdays.findIndex(v=>v===p.day2)));setTime1(p.time1);setTime2(p.time2);}
  }});},[]);
  const minute=(value:string)=>{const [h,m]=value.split(":").map(Number);return h*60+m;};
  const input={...key,weekStart,timezone,slots:[{day:day1,minute:minute(time1)},{day:day2,minute:minute(time2)}]};
  const fingerprint=JSON.stringify(input);
  const [checked,setChecked]=useState("");
  const allowed=check.data?.available && checked===fingerprint;
  async function preview(){setMessage("");try{await check.mutateAsync(input);setChecked(fingerprint);}catch(e){setMessage(e instanceof Error?e.message:"Unable to check times.");}}
  async function reserve(){setMessage("");try{await book.mutateAsync({...input,parentName,confirmsTimes:true});await details.mutateAsync(key);}catch(e){setMessage(e instanceof Error?e.message:"Unable to confirm.");}}
  return <main className="mx-auto max-w-3xl space-y-5 p-6">
    <h1 className="text-2xl font-semibold">{details.data?.allocation ? "Your confirmed Elite teaching schedule" : "Choose your Elite teaching times"}</h1>
    {details.isPending?<p>Loading your private scheduling link…</p>:details.error?<p role="alert">{details.error.message}</p>:details.data && <>
      <p>Student: {details.data.studentName}</p>
      {details.data.allocation?<section className="rounded border p-5 space-y-3"><h2 className="text-xl font-semibold">Teaching schedule confirmed</h2>
        <p>Tutor: {details.data.allocation.tutorName}. All times use {details.data.allocation.timezone}.</p>
        <ol className="divide-y">{details.data.sessions.map(s=><li className="py-2" key={s.id}>{s.sequence}. {sessionDate(s.startsAt,details.data!.allocation!.timezone)} · {s.lessonTitle}</li>)}</ol>
      </section>:<>
        <p>Choose two different days each week. One tutor must be available for both times across all 23 teaching weeks. Times are reserved only when you confirm the complete 46-session schedule.</p>
        <label className="block">Monday of the first teaching week<input type="date" className="ml-3 rounded border p-2" value={weekStart} onChange={e=>setWeekStart(e.target.value)}/></label>
        <label className="block">Your time zone<input className="ml-3 rounded border p-2" value={timezone} onChange={e=>setTimezone(e.target.value)}/></label>
        {[[day1,setDay1,time1,setTime1],[day2,setDay2,time2,setTime2]].map(([day,setDay,time,setTime],i)=><div key={i} className="flex flex-wrap gap-3">
          <label>Weekly session {i+1}<select className="ml-3 rounded border p-2" value={day as number} onChange={e=>(setDay as (v:number)=>void)(Number(e.target.value))}>{weekdays.map((d,j)=><option key={d} value={j}>{d}</option>)}</select></label>
          <label>Start time<input type="time" step="1800" className="ml-3 rounded border p-2" value={time as string} onChange={e=>(setTime as (v:string)=>void)(e.target.value)}/></label>
        </div>)}
        <button disabled={check.isPending || !weekStart} onClick={preview} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50">Check both times for the full course</button>
        {checked===fingerprint && check.data && <p role="status">{check.data.available?"A tutor can cover both times. Review all dates below before confirming.":"No tutor can cover both times for the full course. Try different days or times, or contact Schrool."}</p>}
        {allowed && <section className="space-y-3 rounded border p-5">
          <details><summary>Review all 46 dates in {timezone}</summary><ol>{check.data!.sessions.map(s=><li key={s.sequence}>{s.sequence}. {sessionDate(s.startsAt,timezone)}</li>)}</ol></details>
          <label className="block">Parent or guardian name<input className="ml-3 rounded border p-2" value={parentName} onChange={e=>setParentName(e.target.value)}/></label>
          <label className="block"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> I confirm these two weekly times and the full teaching schedule.</label>
          <button disabled={book.isPending || !confirmed || parentName.trim().length<2} onClick={reserve} className="rounded bg-[#1560B0] px-4 py-3 text-white disabled:opacity-50">Confirm my teaching schedule</button>
        </section>}
      </>}
    </>}
    {message && <p role="alert">{message}</p>}
  </main>;
}
