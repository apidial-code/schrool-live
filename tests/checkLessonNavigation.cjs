// Regression test for the actual lesson component, query hooks and RPC client.
// Run with JSDOM available; server fixtures retain attempts across page remounts.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const esbuild=require('esbuild');
const {JSDOM}=require(process.env.NAV_JSDOM || 'jsdom');
(async()=>{
 const dom=new JSDOM('<!doctype html><div id="root"></div>',{url:'http://localhost/student/lesson?enrollmentId=14&lessonId=19',pretendToBeVisual:true});
 Object.assign(global,{window:dom.window,document:dom.window.document,location:dom.window.location,history:dom.window.history,Event:dom.window.Event,IS_REACT_ACT_ENVIRONMENT:true});
 Object.defineProperty(global,'navigator',{configurable:true,value:dom.window.navigator});
 global.addEventListener=dom.window.addEventListener.bind(dom.window);global.removeEventListener=dom.window.removeEventListener.bind(dom.window);global.dispatchEvent=dom.window.dispatchEvent.bind(dom.window);
 const out=path.join(__dirname,'.navigation-harness.cjs');
 await esbuild.build({entryPoints:[path.join(__dirname,'navigationHarness.tsx')],outfile:out,bundle:true,platform:'node',format:'cjs',jsx:'automatic',plugins:[{name:'five-questions',setup(b){b.onResolve({filter:/FiveQuestions\.tsx$/},()=>({path:'empty',namespace:'mock'}));b.onLoad({filter:/.*/,namespace:'mock'},()=>({contents:'export const StudentFiveQuestions=()=>null;',loader:'tsx'}));}}]});
 const app=require(out);const sj=(await import('superjson')).default;
 const store=new Map();const requests=[];let pendingReads=[];let hold=false;let onRead;
 const title=id=>id===19?'HCF and LCM of Large Numbers':id===20?'Square and Cube Roots':'What is a Decimal?';
 const key=(i,d)=>`${i.enrollmentId}:${i.lessonId}:${d}`;
 const clone=o=>JSON.parse(JSON.stringify(o));
 function summary(i){let levels={},active=[],history=[];for(const d of ['easy','medium','challenging']){const a=store.get(key(i,d));levels[d]={bestScore:a?.status==='submitted'?10:0,attempts:a?.status==='submitted'?1:0,unlocked:d==='easy'||store.get(key(i,d==='medium'?'easy':'medium'))?.status==='submitted'};if(a?.status==='in_progress')active.push({attemptToken:a.attemptToken,difficulty:d});if(a?.status==='submitted')history.push({attemptToken:a.attemptToken,difficulty:d,validScore:10})}return {available:true,levels,active,history,completed:false,standard:true,tutorGuided:false,nextLesson:null}}
 const fetcher=async(url,opts={})=>{const u=new URL(url);const methods=u.pathname.split('/').at(-1).split(',');const batch=JSON.parse(opts.body||u.searchParams.get('input'));const values=await Promise.all(methods.map(async(method,n)=>{const i=sj.deserialize(batch[n]);requests.push({method,...i});let data;
  if(method==='lessons.getById')data={id:i.lessonId,title:title(i.lessonId),orderIndex:i.lessonId-2,bunnyLibraryId:null,bunnyVideoId:null};
  else if(method==='lessons.getExercises')data=summary(i);
  else if(method==='lessons.startAttempt'){const k=key(i,i.difficulty);if(!store.has(k)||store.get(k).status==='submitted')store.set(k,{attemptToken:crypto.randomUUID(),difficulty:i.difficulty,status:'in_progress',answers:{},solutionViewed:[],rawScore:null,validScore:null,submittedAt:null,questions:Array.from({length:10},(_,j)=>({sourceId:`L${i.lessonId}-${i.difficulty}-${j}`,questionText:`${title(i.lessonId)} ${i.difficulty} question ${j+1}`,diagram:null,options:['Correct','Wrong'],hasSolution:false}))});data=store.get(k)}
  else {const a=[...store.entries()].find(([k,a])=>k.startsWith(`${i.enrollmentId}:${i.lessonId}:`)&&a.attemptToken===i.attemptToken)?.[1];assert(a,'Attempt must belong to requested enrolment and lesson');if(method==='lessons.saveAnswer')a.answers[i.sourceId]=i.optionIndex;else if(method==='lessons.submitAttempt'){assert.equal(Object.keys(a.answers).length,10);a.status='submitted';a.rawScore=a.validScore=10;a.submittedAt=new Date().toISOString()}else assert.equal(method,'lessons.getAttempt');data=a}
  const snapshot=clone(data);if(hold&&['lessons.getById','lessons.getExercises','lessons.getAttempt'].includes(method))await new Promise(resolve=>pendingReads.push(resolve));if(onRead)onRead(method);return {result:{data:sj.serialize(snapshot)}}}));return new Response(JSON.stringify(values),{headers:{'Content-Type':'application/json'}})};
 const tick=()=>new Promise(r=>setTimeout(r,15));
 async function waitFor(test,label){for(let n=0;n<150;n++){await app.act(async()=>{await tick()});if(test())return}throw Error('Timed out: '+label+'\n'+document.body.textContent)}
 const buttons=()=>[...document.querySelectorAll('button')];
 const click=async b=>{assert(b,'Button exists');await app.act(async()=>{b.dispatchEvent(new window.MouseEvent('click',{bubbles:true}))})};
 const question=n=>buttons().find(b=>b.getAttribute('aria-label')?.startsWith(`Question ${n},`)||b.getAttribute('aria-label')===`Question ${n}`);
 const levelButton=n=>buttons().filter(b=>['Start','Resume','Locked'].includes(b.textContent))[n];
 const answer=async()=>{await click(document.querySelector('input[type=radio]'));await waitFor(()=>!levelButton(0).disabled,'answer saved')};
 let root;await app.act(async()=>{root=app.mount(document.getElementById('root'),fetcher)});
 await waitFor(()=>!!levelButton(0),'initial HCF');
 await app.act(async()=>{window.history.pushState({},'', '/student/lesson?enrollmentId=14&lessonId=20')});
 await waitFor(()=>document.querySelector('h1')?.textContent==='Square and Cube Roots','query-only lesson navigation');
 await waitFor(()=>!!levelButton(0),'new lesson controls');await click(levelButton(0));await waitFor(()=>!!question(1),'start Easy');
 for(let n=1;n<=10;n++){await click(question(n));await answer()}
 await click(buttons().find(b=>b.textContent==='Submit all 10 answers'));await waitFor(()=>document.body.textContent.includes('Easy result'),'Easy submitted');
 await click(levelButton(1));await waitFor(()=>document.body.textContent.includes('Medium · Question 1'),'start Medium');await answer();await click(question(2));
 hold=true;app.focusManager.setFocused(false);await app.act(async()=>{app.focusManager.setFocused(true);await tick()});
 await waitFor(()=>pendingReads.length>=3,'background focus requests');
 assert.equal(document.querySelector('h1').textContent,'Square and Cube Roots');assert(document.body.textContent.includes('Medium · Question 2'),'Q2 stays mounted during focus recheck');assert(question(2),'navigation remains present');
 hold=false;await app.act(async()=>{pendingReads.splice(0).forEach(r=>r());await tick()});
 await waitFor(()=>document.body.textContent.includes('Medium · Question 2'),'Q2 retained after recheck');
 await click(question(1));assert(document.querySelector('input[type=radio]').checked,'Saved Q1 selection retained');await click(question(2));
 app.onlineManager.setOnline(false);await app.act(async()=>{app.onlineManager.setOnline(true);await tick()});await waitFor(()=>document.body.textContent.includes('Medium · Question 2'),'reconnect retains Q2');
 // A background attempt read is deliberately delayed until after a newer save.
 hold=true;const stale=app.queryClient.refetchQueries({predicate:q=>JSON.stringify(q.queryKey).includes('getAttempt')});await waitFor(()=>pendingReads.length>=1,'delayed attempt read');await answer();hold=false;await app.act(async()=>{pendingReads.splice(0).forEach(r=>r());await tick()});await stale;
 await click(question(2));assert(document.querySelector('input[type=radio]').checked,'Old background response must not erase newer Q2 answer');
 // Simulate full refresh: browser query cache and component state are recreated; server attempt survives.
 await app.act(async()=>{root.unmount();app.queryClient.clear();root=app.mount(document.getElementById('root'),fetcher)});
 await waitFor(()=>levelButton(1)?.textContent==='Resume','refresh offers Resume Medium');await click(levelButton(1));await waitFor(()=>document.body.textContent.includes('Medium · Question 3'),'Resume first unanswered question');
 await click(question(1));assert(document.querySelector('input[type=radio]').checked,'Q1 survives refresh');await click(question(2));assert(document.querySelector('input[type=radio]').checked,'Q2 survives refresh');
 await app.act(async()=>{history.pushState({},'', '/student/lesson?enrollmentId=14&lessonId=19')});await waitFor(()=>document.querySelector('h1')?.textContent===title(19),'explicit previous lesson');assert(!document.body.textContent.includes('Medium · Question'),'attempt state does not leak across lessons');
 await app.act(async()=>{history.back()});await waitFor(()=>document.querySelector('h1')?.textContent===title(20),'browser Back');await waitFor(()=>levelButton(1)?.textContent==='Resume','Back preserves server resume');
 assert(requests.filter(r=>['lessons.saveAnswer','lessons.submitAttempt'].includes(r.method)).every(r=>r.lessonId===20&&r.enrollmentId===14),'All mutations scoped to current lesson');
 await app.act(async()=>{root.unmount();app.queryClient.clear()});dom.window.close();fs.unlinkSync(out);
 process.exitCode=0;console.log('PASS: query-only lesson change; Easy submission; Medium Q1 save/Q2 navigation; focus and reconnect refresh; delayed stale response; refresh/Resume with saved Q1/Q2; previous lesson and browser Back; scoped mutations.');process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});
