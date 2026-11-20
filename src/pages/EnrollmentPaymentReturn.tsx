import React, { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

export default function EnrollmentPaymentReturn() {
  const [{ cancelled, sessionId }] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ids = params.getAll("session_id");
    const id = ids[0] ?? "";

    return {
      cancelled: params.get("cancelled") === "1",
      sessionId:
        ids.length === 1 &&
        id.length <= 255 &&
        /^cs_test_[A-Za-z0-9]+$/.test(id)
          ? id
          : null,
    };
  });

  const started = useRef(false);
  const { mutate, data, isPending, isError } =
    trpc.enrollmentNew.getParentCheckoutStatus.useMutation({
      retry: false,
    });

  useEffect(() => {
    if (cancelled || !sessionId || started.current) return;
    started.current = true;
    mutate({ sessionId });
  }, [cancelled, sessionId, mutate]);

  const confirmed = data?.status === "confirmed";

  let message = "Checking whether Schrool has recorded your payment…";

  if (cancelled) {
    message =
      "You returned from checkout. Reopen your original enrolment review link to continue.";
  } else if (!sessionId) {
    message =
      "The payment reference is missing or invalid. Please contact your consultant.";
  } else if (isError) {
    message =
      "We couldn’t check the payment status. Try checking again below.";
  } else if (confirmed) {
    message = "Thank you for your payment. Schrool has recorded your payment.";
  } else if (data?.status === "pending") {
    message =
      "Payment confirmation is pending. Wait a few seconds, then check again.";
  } else if (data?.status === "unavailable") {
    message =
      "Schrool couldn’t find this checkout. Check again or contact your consultant.";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <section className="mx-auto max-w-2xl rounded-xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-[#1560B0]">
          {confirmed ? "Payment recorded" : "Payment status"}
        </h1>
        <p role="status" className="mt-4">
          {isPending ? "Checking payment status…" : message}
        </p>
        {confirmed && (
          <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5" aria-label="Student sign-in instructions">
            <h2 className="text-xl font-semibold">Next step: student sign-in</h2>
            <p className="mt-3">Use the student email address recorded on your enrolment. The student signs in separately from the parent. No password is needed.</p>
            <ol className="mt-3 list-decimal space-y-2 pl-6">
              <li>Open the sign-in page below and enter the student email address.</li>
              <li>Request a sign-in link (magic link), then open the email sent to the student and follow the link within 15 minutes.</li>
              <li>On My enrolments, select View lessons and open the first available lesson.</li>
            </ol>
            <a href="/login" className="mt-5 inline-block rounded-lg bg-[#1560B0] px-5 py-3 font-semibold text-white">Go to student sign-in</a>
            <p className="mt-4 text-sm">You can sign in even if the welcome email has not arrived. Check Spam for the requested sign-in email. If your course is unavailable after signing in, contact your consultant. Do not pay again.</p>
          </section>
        )}
        {!cancelled && sessionId && !confirmed && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => mutate({ sessionId })}
            className="mt-4 rounded-lg bg-[#1560B0] px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            Check payment status
          </button>
        )}
      </section>
    </main>
  );
}
