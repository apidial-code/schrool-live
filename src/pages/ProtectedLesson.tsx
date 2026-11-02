import React, { useRef, useState } from "react";
import { trpc } from "../lib/trpc";

type Attempt = ReturnType<typeof import("../../server/routers/lessons").publicAttempt>;
type Level = "easy" | "medium" | "challenging";
const levels: Level[] = ["easy", "medium", "challenging"];
const names = { easy: "Easy", medium: "Medium", challenging: "Challenging" };
const button = "rounded-lg bg-[#1560B0] px-5 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
function readId(name: string) {
  const values = new URLSearchParams(window.location.search).getAll(name);
  if (values.length !== 1 || !/^[1-9][0-9]*$/.test(values[0])) return 0;
  const value = Number(values[0]);
  return Number.isSafeInteger(value) ? value : 0;
}
// Lesson 1 uses simple TeX fractions. Render them as React elements, keeping
// question text escaped and avoiding HTML injection or an external renderer.
function MathText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const pattern = /\\frac\{([^{}]+)\}\{([^{}]+)\}/g;
  let last = 0, match: RegExpExecArray | null;
  while ((match = pattern.exec(text))) {
    parts.push(text.slice(last, match.index));
    parts.push(<span key={match.index} role="math" aria-label={`${match[1]} over ${match[2]}`}
      className="mx-1 inline-flex flex-col items-center align-middle text-center leading-tight">
      <span aria-hidden="true" className="w-full border-b border-current px-1 pb-0.5">{match[1]}</span>
      <span aria-hidden="true" className="px-1 pt-0.5">{match[2]}</span>
    </span>);
    last = pattern.lastIndex;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
function Video({ url, title }: { url: string; title: string }) {
  return <div className="relative mt-5 aspect-video overflow-hidden rounded-lg bg-black">
    <iframe src={url} title={title} className="absolute inset-0 h-full w-full border-0"
      loading="lazy" allow="accelerometer; gyroscope; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
  </div>;
}
function message(error: any) {
  return error?.data?.code === "UNAUTHORIZED" ? "Please sign in to continue."
    : error?.data?.code === "FORBIDDEN" ? "Course access or this difficulty is currently locked."
    : error?.message || "Unable to complete this action. Please try again.";
}
function Exercises({ enrollmentId, lessonId }: { enrollmentId: number; lessonId: number }) {
  const input = { enrollmentId, lessonId };
  const utils = trpc.useUtils();
  const summary = trpc.lessons.getExercises.useQuery(input, {
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: "always",
  });
  const [token, setToken] = useState("");
  const [number, setNumber] = useState(0);
  const [solution, setSolution] = useState<{ sourceId: string; url: string } | null>(null);
  const [actionError, setActionError] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const attemptInput = { ...input, attemptToken: token };
  const attempt = trpc.lessons.getAttempt.useQuery(attemptInput, {
    enabled: !!token, retry: false, staleTime: 0, gcTime: 0,
    refetchOnWindowFocus: "always",
  });
  const start = trpc.lessons.startAttempt.useMutation();
  const save = trpc.lessons.saveAnswer.useMutation();
  const view = trpc.lessons.viewSolution.useMutation();
  const submit = trpc.lessons.submitAttempt.useMutation();
  function remember(data: Attempt) {
    utils.lessons.getAttempt.setData({ ...input, attemptToken: data.attemptToken }, data);
    setToken(data.attemptToken);
  }
  async function act(action: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true; setBusy(true); setActionError(null);
    try { await action(); }
    catch (error) { setSolution(null); setActionError(error); }
    finally { locked.current = false; setBusy(false); }
  }
  async function openLevel(level: Level) {
    await act(async () => {
      const data = await start.mutateAsync({ ...input, difficulty: level });
      setSolution(null); setNumber(0); remember(data);
      await summary.refetch();
    });
  }
  if (summary.isLoading || summary.isFetching) return <p className="mt-6" role="status">Checking exercises and saved progress…</p>;
  if (summary.error) return <div className="mt-6" role="alert"><p>{message(summary.error)}</p>
    {summary.error.data?.code === "UNAUTHORIZED" ? <a className="underline" href="/login">Go to sign in</a>
      : <button className={`${secondary} mt-3`} onClick={() => summary.refetch()}>Try again</button>}</div>;
  if (!summary.data?.available) return <p className="mt-6">Exercises have not been added to this lesson yet.</p>;
  const data: Attempt | undefined = attempt.data;
  const question = data?.questions[number];
  const answered = data ? data.questions.filter(q => data.answers[q.sourceId] !== undefined).length : 0;
  const submitted = data?.status === "submitted";
  const denied = ["FORBIDDEN", "UNAUTHORIZED"].includes(actionError?.data?.code);
  return <section className="mt-8 border-t border-slate-200 pt-6" aria-label="Lesson exercises">
    <h2 className="text-xl font-semibold">Exercises</h2>
    <p className="mt-2 text-slate-600">Answer all 10 questions, then submit. A valid score of 8/10 unlocks the next difficulty.</p>
    <p className="mt-2 text-sm text-slate-600">Opening a solution before submission excludes that question from your valid score for this attempt. Answers are saved after each selection.</p>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      {levels.map(level => {
        const progress = summary.data!.levels[level];
        const active = summary.data!.active.some((a: { difficulty: string }) => a.difficulty === level);
        return <div key={level} className="rounded-lg border border-slate-200 p-4">
          <h3 className="font-semibold">{names[level]}</h3>
          <p className="my-2 text-sm">Best valid score: {progress.bestScore}/10 · Attempts: {progress.attempts}</p>
          <button className={button} disabled={busy || !progress.unlocked} onClick={() => openLevel(level)}>
            {!progress.unlocked ? "Locked" : active ? "Resume" : "Start"}
          </button>
        </div>;
      })}
    </div>
    {actionError && <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
      <p>{message(actionError)}</p>
      {denied && <a className="mt-2 inline-block underline" href={actionError.data?.code === "UNAUTHORIZED" ? "/login" : "/student"}>
        {actionError.data?.code === "UNAUTHORIZED" ? "Go to sign in" : "Back to my enrolments"}</a>}
      {!denied && <p className="mt-1 text-sm">The last action could not be confirmed. Resume the difficulty to reload its saved state before continuing.</p>}
    </div>}
    {busy && <p className="mt-3" role="status">Saving…</p>}
    {token && !denied && <div className="mt-6">
      {attempt.isLoading || attempt.isFetching ? <p role="status">Loading saved attempt…</p>
        : attempt.error ? <div role="alert"><p>{message(attempt.error)}</p>
          {attempt.error.data?.code === "UNAUTHORIZED" ? <a href="/login" className="underline">Go to sign in</a>
            : <button className={secondary} onClick={() => attempt.refetch()}>Reload attempt</button>}</div>
        : data && question && <>
          {submitted && <div role="status" className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-5">
            <h3 className="text-lg font-semibold">{names[data.difficulty as Level]} result</h3>
            <p className="mt-2">Correct answers: {data.rawScore}/10</p>
            <p className="font-semibold">Valid score: {data.validScore}/10</p>
            <p className="mt-2">{(data.validScore ?? 0) >= 8 ? "Passed. Your progress has been saved." : "Keep practising. You need a valid score of 8/10 to pass."}</p>
            <p className="mt-2 text-sm">Use Start above for a new attempt. You can review these questions and their solutions below.</p>
          </div>}
          <div className="flex flex-wrap gap-2" aria-label="Question navigation">
            {data.questions.map((q, i) => <button key={q.sourceId} disabled={busy}
              aria-label={`Question ${i + 1}${data.answers[q.sourceId] !== undefined ? ", answered" : ""}`}
              aria-current={i === number ? "step" : undefined}
              className={`h-10 w-10 rounded border ${i === number ? "border-[#1560B0] bg-[#1560B0] text-white" : data.answers[q.sourceId] !== undefined ? "border-blue-300 bg-blue-50" : "border-slate-300"}`}
              onClick={() => { setNumber(i); setSolution(null); }}>{i + 1}</button>)}
          </div>
          <div className="mt-5 rounded-xl border border-slate-200 p-5 sm:p-6">
            <p className="text-sm text-slate-600">{names[data.difficulty as Level]} · Question {number + 1} of 10 · {answered}/10 answered</p>
            <h3 className="mt-5 text-xl leading-loose"><MathText text={question.questionText} /></h3>
            {question.diagram && /^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(question.diagram) &&
              <img className="my-5 max-h-80 max-w-full object-contain" src={question.diagram} alt={`Diagram for question ${number + 1}`} />}
            <fieldset disabled={busy || submitted || !!actionError} className="mt-5 grid gap-3">
              <legend className="sr-only">Select your answer</legend>
              {question.options.map((option, i) => <label key={`${question.sourceId}:${i}`}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border p-4 text-xl ${data.answers[question.sourceId] === i ? "border-[#1560B0] bg-blue-50" : "border-slate-200"}`}>
                <input type="radio" name={`${token}:${question.sourceId}`} checked={data.answers[question.sourceId] === i}
                  onChange={() => act(async () => { const updated = await save.mutateAsync({ ...attemptInput, sourceId: question.sourceId, optionIndex: i }); remember(updated); })} />
                <span className="text-sm text-slate-500">{String.fromCharCode(65 + i)}.</span>
                <span><MathText text={option} /></span>
              </label>)}
            </fieldset>
            {data.answers[question.sourceId] !== undefined && !busy && !actionError && <p className="mt-3 text-sm text-slate-600">{submitted ? "Submitted answer" : "Answer saved"}</p>}
            {data.solutionViewed.includes(question.sourceId) && <p className="mt-3 text-sm text-amber-800">Solution opened before submission. This question does not count towards this attempt’s valid score.</p>}
            <button className={`${secondary} mt-5`} disabled={busy || !question.hasSolution || !!actionError}
              onClick={() => act(async () => { const response = await view.mutateAsync({ ...attemptInput, sourceId: question.sourceId }); remember(response.attempt); setSolution({ sourceId: response.sourceId, url: response.url }); })}>
              {question.hasSolution ? "Watch worked solution" : "Solution video not available yet"}
            </button>
            {solution?.sourceId === question.sourceId && <div>
              <button className="mt-4 text-sm underline" onClick={() => setSolution(null)}>Close solution</button>
              <Video url={solution.url} title={`Worked solution for question ${number + 1}`} />
            </div>}
            <div className="mt-6 flex justify-between gap-3">
              <button className={secondary} disabled={busy || number === 0} onClick={() => { setNumber(n => n - 1); setSolution(null); }}>Previous</button>
              <button className={secondary} disabled={busy || number === 9} onClick={() => { setNumber(n => n + 1); setSolution(null); }}>Next</button>
            </div>
          </div>
          {!submitted && <div className="mt-5">
            <button className={button} disabled={busy || answered !== 10 || !!actionError}
              onClick={() => act(async () => { const result = await submit.mutateAsync(attemptInput); setSolution(null); remember(result); await summary.refetch(); })}>
              Submit all 10 answers
            </button>
            <p className="mt-2 text-sm text-slate-600">{answered === 10 ? "All answers saved. Ready to submit." : `Answer the remaining ${10 - answered} questions before submitting.`}</p>
          </div>}
        </>}
    </div>}
    {!!summary.data.history.length && <div className="mt-8">
      <h3 className="font-semibold">Recent attempts</h3>
      <ul className="mt-3 space-y-2">{summary.data.history.map((item: { attemptToken: string; difficulty: string; validScore: number | null }) =>
        <li key={item.attemptToken} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
          <span>{names[item.difficulty as Level]} · Valid score {item.validScore}/10</span>
          <button className={secondary} disabled={busy} onClick={() => { setToken(item.attemptToken); setNumber(0); setSolution(null); setActionError(null); }}>Review</button>
        </li>)}</ul>
    </div>}
  </section>;
}
export default function ProtectedLesson() {
  const enrollmentId = readId("enrollmentId"), lessonId = readId("lessonId");
  const valid = enrollmentId > 0 && lessonId > 0;
  const lesson = trpc.lessons.getById.useQuery({ enrollmentId, lessonId }, {
    enabled: valid, retry: false, staleTime: 0, gcTime: 0,
    refetchOnMount: "always", refetchOnWindowFocus: "always",
  });
  const videoId = lesson.data?.bunnyVideoId;
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
    <div className="mx-auto max-w-4xl">
      <a href="/student" className="text-[#1560B0] underline">Back to my enrolments</a>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        {!valid ? <h1 className="text-xl font-semibold">Invalid lesson link</h1>
          : lesson.isFetching || lesson.isLoading ? <p role="status">Checking lesson access…</p>
          : lesson.error ? <div role="alert"><h1 className="text-xl font-semibold">Lesson unavailable</h1>
            <p className="mt-3">{message(lesson.error)}</p>
            {lesson.error.data?.code === "UNAUTHORIZED" ? <a href="/login" className="mt-4 inline-block underline">Go to sign in</a>
              : <button onClick={() => lesson.refetch()} className="mt-4 underline">Try again</button>}</div>
          : lesson.data ? <>
            <h1 className="text-2xl font-bold text-[#1560B0]">{lesson.data.title || "Lesson"}</h1>
            {lesson.data.bunnyLibraryId && lesson.data.bunnyLibraryId > 0 && videoId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(videoId)
              ? <Video url={`https://iframe.mediadelivery.net/embed/${lesson.data.bunnyLibraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=false&responsive=true`} title={lesson.data.title || "Lesson video"} />
              : <p className="mt-4">Video unavailable for this lesson.</p>}
            <Exercises key={`${enrollmentId}:${lessonId}`} enrollmentId={enrollmentId} lessonId={lessonId} />
          </> : <p>Lesson unavailable.</p>}
      </section>
    </div>
  </main>;
}
