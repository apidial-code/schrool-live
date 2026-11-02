import React from "react";
import { trpc } from "../lib/trpc";

function readId(name: string) {
  const values = new URLSearchParams(window.location.search).getAll(name);
  if (values.length !== 1 || !/^[1-9][0-9]*$/.test(values[0])) return 0;

  const value = Number(values[0]);
  return Number.isSafeInteger(value) ? value : 0;
}

export default function ProtectedLesson() {
  const enrollmentId = readId("enrollmentId");
  const lessonId = readId("lessonId");
  const valid = enrollmentId > 0 && lessonId > 0;

  const lesson = trpc.lessons.getById.useQuery(
    { enrollmentId, lessonId },
    {
      enabled: valid,
      retry: false,
      staleTime: 0,
      gcTime: 0,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
    },
  );

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <a href="/student" className="text-[#1560B0] underline">
          Back to my enrolments
        </a>

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          {!valid ? (
            <h1 className="text-xl font-semibold">Invalid lesson link</h1>
          ) : lesson.isFetching || lesson.isLoading ? (
            <p role="status">Checking lesson access…</p>
          ) : lesson.error ? (
            <div role="alert">
              <h1 className="text-xl font-semibold">Lesson unavailable</h1>
              <p className="mt-3">
                {lesson.error.data?.code === "UNAUTHORIZED"
                  ? "Please sign in to open this lesson."
                  : lesson.error.data?.code === "FORBIDDEN"
                    ? "Course access is currently locked."
                    : lesson.error.data?.code === "NOT_FOUND"
                      ? "This lesson is not available in your course."
                      : "Unable to load this lesson. Please try again."}
              </p>

              {lesson.error.data?.code === "UNAUTHORIZED" ? (
                <a href="/login" className="mt-4 inline-block underline">
                  Go to sign in
                </a>
              ) : (
                <button
                  onClick={() => lesson.refetch()}
                  className="mt-4 underline"
                >
                  Try again
                </button>
              )}
            </div>
          ) : lesson.data ? (
            <>
              <h1 className="text-2xl font-bold text-[#1560B0]">
                {lesson.data.title || "Lesson"}
              </h1>
              <p className="mt-4">
                Videos and exercises have not been added to this lesson yet.
              </p>
            </>
          ) : (
            <p>Lesson unavailable.</p>
          )}
        </section>
      </div>
    </main>
  );
}
