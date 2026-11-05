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

  let message = "Checking whether Schrool has recorded your test payment…";

  if (cancelled) {
    message =
      "You returned from checkout. Reopen your original enrolment review link to continue.";
  } else if (!sessionId) {
    message =
      "The Stripe test checkout reference is missing or invalid. Please contact your consultant.";
  } else if (isError) {
    message =
      "We couldn’t check the payment status. Try checking again below.";
  } else if (confirmed) {
    message = "Schrool has recorded your initial test payment.";
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
          {confirmed ? "Test payment recorded" : "Stripe test checkout"}
        </h1>
        <p role="status" className="mt-4">
          {isPending ? "Checking payment status…" : message}
        </p>
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
