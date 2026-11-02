import React from "react";
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
                  <CourseAccessCheck enrollmentId={item.id} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
function CourseAccessCheck({ enrollmentId }: { enrollmentId: number }) {
  const access = trpc.student.checkCourseAccess.useQuery(
    { enrollmentId },
    { enabled: false, retry: false, gcTime: 0 },
  );

  return (
    <div className="mt-4">
      <button
        onClick={() => access.refetch()}
        disabled={access.isFetching}
        className="rounded-lg bg-[#1560B0] px-4 py-2 text-white disabled:opacity-50"
      >
        {access.isFetching ? "Checking…" : "Check course access"}
      </button>

      <div role="status" className="mt-3">
        {!access.isFetching && access.error ? (
          <p>
            {access.error.data?.code === "FORBIDDEN"
              ? "Course access is currently locked."
              : access.error.data?.code === "UNAUTHORIZED"
                ? "Please sign in again to check access."
                : "Unable to check course access. Please try again."}
          </p>
        ) : !access.isFetching && access.data ? (
          <p>
            Access check passed. Lesson opening is not connected yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}
