import React from "react";
import { courseOverview, courseLevels } from "../../shared/courseProgress";
import { trpc } from "../lib/trpc";

export default function StudentHome() {
  const enrolments = trpc.student.myEnrollments.useQuery(undefined, {
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const logout = trpc.auth.logout.useMutation({ retry: false });
  const [error, setError] = React.useState("");

  async function signOut() {
    setError("");
    try {
      await logout.mutateAsync();
      window.location.replace("/login");
    } catch {
      setError("Unable to sign out. Please try again.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#1560B0]">
            Sch<span className="text-[#FF7A00]">r</span>ool
          </h1>
          <button
            onClick={signOut}
            disabled={logout.isPending}
            className="rounded-lg border border-slate-300 px-4 py-2"
          >
            {logout.isPending ? "Signing out…" : "Logout"}
          </button>
        </header>

        {error && <p role="alert">{error}</p>}

        <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold">My enrolments</h2>

          {enrolments.isLoading ? (
            <p role="status" className="mt-4">
              Loading your enrolments…
            </p>
          ) : enrolments.error ? (
            <div role="alert" className="mt-4">
              <p>Unable to load your enrolments.</p>
              <button
                onClick={() => enrolments.refetch()}
                className="mt-3 underline"
              >
                Try again
              </button>
            </div>
          ) : !enrolments.data?.length ? (
            <div className="py-10">
              <h3 className="text-xl font-semibold text-[#1560B0]">
                No active course yet
              </h3>
              <p className="mt-3">
                You have no enrolments linked to this student account.
              </p>
              <p className="mt-2">
                If you have already enrolled, please contact Schrool.
              </p>
            </div>
          ) : (
            <ul className="mt-5 space-y-4">
              {enrolments.data.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-5"
                >
                  <h3 className="font-semibold">Enrolment #{item.id}</h3>
                  <p>
                    {item.yearLevel || "Course details pending"}
                    {" · "}
                    {item.tier || "Package pending"}
                  </p>
                  <p>Enrolment status: {item.status}</p>
                  <p>Payment status: {item.paymentStatus}</p>
                  {item.tier === "elite" && <p className="mt-2 text-sm text-slate-600">46 one-hour teaching sessions, normally two each week across 23 teaching weeks. Learning access ends when course completion is confirmed.</p>}
                  {item.accessEndsAt && <p className="mt-2 text-sm text-slate-600">Access ends {new Date(item.accessEndsAt).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}</p>}
                  {item.status === "completed" ? <p className="mt-3 font-semibold">Your course is completed. Learning access is closed.</p> : <CourseLessons enrollmentId={item.id} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
function CourseLessons({ enrollmentId }: { enrollmentId: number }) {
  const lessons = trpc.lessons.list.useQuery(
    { enrollmentId },
    { enabled: false, retry: false, gcTime: 0, staleTime: 0 },
  );

  const overview = courseOverview(lessons.data ?? []);
  const names = { easy: "Easy", medium: "Medium", challenging: "Challenging" };
  const lessonUrl = (id: number) => `/student/lesson?enrollmentId=${enrollmentId}&lessonId=${id}`;
  return (
    <div className="mt-4">
      <button
        onClick={() => lessons.refetch()}
        disabled={lessons.isFetching}
        className="rounded-lg bg-[#1560B0] px-4 py-2 text-white disabled:opacity-50"
      >
        {lessons.isFetching ? "Loading…" : lessons.data ? "Refresh progress" : "View lessons"}
      </button>

      <div role="status" className="mt-3">
        {!lessons.isFetching && lessons.error ? (
          <p>
            {lessons.error.data?.code === "FORBIDDEN"
              ? "Course access is currently locked."
              : lessons.error.data?.code === "UNAUTHORIZED"
                ? "Please sign in again to view lessons."
                : "Unable to load lessons. Please try again."}
          </p>
        ) : !lessons.isFetching && lessons.data ? (
          lessons.data.length ? (
            <>
            <section className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-5" aria-label="Course progress">
              <h3 className="text-xl font-semibold">{overview.courseComplete ? (lessons.data[0]?.tutorGuided ? "Exercises completed" : "Course complete") : "Your course progress"}</h3>
              <p className="mt-2">{overview.completed} of {overview.total} lessons completed · {overview.percentage}%</p>
              <progress className="mt-3 h-4 w-full accent-[#1560B0]" max={overview.total} value={overview.completed} aria-label="Lessons completed" />
              <p className="mt-3 text-sm">A lesson is complete when Easy, Medium and Challenging each have a best valid score of at least 8/10.</p>
              {overview.courseComplete ? <p className="mt-3 font-semibold text-green-800">Well done! You have passed all three difficulties in every lesson. {lessons.data[0]?.tutorGuided ? "Your tutor must confirm the remaining Elite course requirements. Learning access ends on confirmed course completion." : "You can revisit lessons while your course access remains active."}</p>
                : overview.nextLesson && !overview.nextLesson.tutorGuided ? <a className="mt-4 inline-block rounded-lg bg-[#1560B0] px-5 py-3 font-semibold text-white" href={lessonUrl(overview.nextLesson.id)}>
                  Continue learning: {overview.nextLesson.title || "Next lesson"}
                </a> : null}
              {lessons.data[0]?.tutorGuided && <p className="mt-3">These totals show exercise progress. Your tutor guides lesson progression and confirms your Elite course requirements.</p>}
            </section>
            <p className="mb-3 text-sm text-slate-600">Scores below are your best valid scores from submitted attempts. Opening a worked solution before submission excludes that question from the valid score.</p>
            <ul className="space-y-2">
              {lessons.data.map((lesson, index) => (
                <li
                  key={lesson.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  {lesson.unlocked ? (
                    <a
                      href={lessonUrl(lesson.id)}
                      className="text-[#1560B0] underline"
                    >
                      {index + 1}. {lesson.title || "Untitled lesson"}
                    </a>
                  ) : (
                    <span>{index + 1}. {lesson.title || "Untitled lesson"} · Locked</span>
                  )}
                  {lesson.completed ? <span className="ml-2 text-sm font-semibold text-green-800">Complete</span>
                    : lesson.unlocked && <span className="ml-2 text-sm text-slate-600">{courseLevels.some(level => lesson.levelScores[level].active || lesson.levelScores[level].attempts > 0) ? "In progress" : "Not started"}</span>}
                  <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                    {courseLevels.map(level => {
                      const score = lesson.levelScores[level];
                      return <div key={level} className="rounded border border-slate-200 bg-slate-50 p-3">
                        <dt className="font-semibold">{names[level]}</dt>
                        <dd>{score.bestScore === null ? "No submitted score" : `${score.bestScore}/10${score.bestScore >= 8 ? " · Passed" : " · Keep practising"}`}</dd>
                        <dd className="mt-1 text-sm text-slate-600">{score.attempts} submitted {score.attempts === 1 ? "attempt" : "attempts"}{score.active ? " · Attempt saved" : ""}</dd>
                      </div>;
                    })}
                  </dl>
                </li>
              ))}
            </ul>
            </>
          ) : (
            <p>No lessons have been added to this course yet.</p>
          )
        ) : null}
      </div>
    </div>
  );
}
