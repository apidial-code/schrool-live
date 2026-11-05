import React, { useEffect, useRef, useState } from "react";
import { trpc } from "../lib/trpc";

const money = (cents: number) =>
  new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
  }).format(cents / 100);

export default function ParentEnrollmentReview() {
  const [link] = useState(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const ids = params.getAll("enrollmentId");
    const tokens = params.getAll("token");
    const enrollmentId = Number(ids[0]);
    const token = tokens[0] ?? "";

    if (
      ids.length !== 1 ||
      tokens.length !== 1 ||
      !Number.isSafeInteger(enrollmentId) ||
      enrollmentId <= 0 ||
      !/^[a-f0-9]{64}$/.test(token)
    ) {
      return null;
    }

    return { enrollmentId, token };
  });

  const started = useRef(false);
  const review = trpc.enrollmentNew.openParentReview.useMutation({
    retry: false,
  });
  const acceptance = trpc.enrollmentNew.acceptParentReview.useMutation({
    retry: false,
  });

  const [acceptedName, setAcceptedName] = useState("");
  const [acceptsAgreement, setAcceptsAgreement] = useState(false);
  const [confirmsAuthority, setConfirmsAuthority] = useState(false);
  const submitting = useRef(false);
  const openingCheckout = useRef(false);
  const checkout = trpc.enrollmentNew.createParentCheckout.useMutation({
    retry: false,
  });

  async function openCheckout() {
    if (!link || openingCheckout.current) return;

    openingCheckout.current = true;

    try {
      const { url } = await checkout.mutateAsync(link);
      window.location.assign(url);
    } catch {
      openingCheckout.current = false;
    }
  }
  useEffect(() => {
    if (!link || started.current) return;
    started.current = true;
    review.mutate(link);
  }, [link, review.mutate]);

  const d = review.data;
  const acceptedAt = acceptance.data?.acceptedAt ?? d?.acceptedAt;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !link || !d || acceptedAt || submitting.current ||
      !acceptsAgreement || !confirmsAuthority ||
      acceptedName.trim().length < 2
    ) {
      return;
    }

    submitting.current = true;

    try {
      await acceptance.mutateAsync({
        ...link,
        termsVersion: d.terms.version,
        reviewDigest: d.reviewDigest,
        acceptedName: acceptedName.trim(),
        acceptsAgreement: true,
        confirmsAuthority: true,
      });
    } catch {
      // The mutation error is displayed beside the confirmation form.
    } finally {
      submitting.current = false;
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <a href="/" className="text-3xl font-bold text-[#1560B0]">
            Sch<span className="text-[#FF7A00]">r</span>ool
          </a>
        </header>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#1560B0]">
            Review your enrolment
          </h1>

          <p className="mt-3 rounded-lg bg-amber-50 p-4 text-sm">
            Staging test. Accepting this agreement records your acceptance.
            Payment remains unpaid and course access stays locked.
          </p>

          {!link && (
            <p role="alert" className="mt-5">
              This review link is incomplete. Please ask your consultant
              for a new link.
            </p>
          )}

          {link && !d && !review.error && (
            <p role="status" className="mt-5">
              Loading your enrolment…
            </p>
          )}

          {review.error && (
            <p role="alert" className="mt-5 text-red-800">
              {review.error.message}
            </p>
          )}

          {d && (
            <>
              <h2 className="mt-6 text-xl font-semibold">
                Enrolment #{d.enrollmentId}
              </h2>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="font-semibold">Course and package</dt>
                  <dd>
                    {d.quote.courseName} ·{" "}
                    {d.quote.tier === "elite"
                      ? "Elite · 5QHackMath"
                      : "Standard"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Student</dt>
                  <dd>
                    {d.family.studentName}, age {d.family.studentAge}
                    {" · "}{d.family.studentEmail}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Parent or guardian</dt>
                  <dd>
                    {d.family.parentName} · {d.family.parentEmail}
                    {" · "}{d.family.phone}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Payment arrangement</dt>
                  <dd>
                    {d.quote.paymentOption === "full"
                      ? "Full payment"
                      : d.quote.paymentOption === "deposit50"
                        ? "50% deposit"
                        : "25% deposit"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold">Total payable · AUD</dt>
                  <dd>{money(d.quote.totalPayableCents)}</dd>
                </div>
              </dl>

              {d.zoomPreferences && (
                <div className="mt-5">
                  <h3 className="font-semibold">
                    Preferred sessions · {d.zoomPreferences.timezone}
                  </h3>
                  <p className="mt-2">
                    {d.zoomPreferences.day1} at {d.zoomPreferences.time1}
                    {" and "}
                    {d.zoomPreferences.day2} at {d.zoomPreferences.time2}.
                    {" "}Subject to tutor availability and confirmation.
                  </p>
                </div>
              )}

              <h3 className="mt-6 font-semibold">Payment schedule</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {d.quote.schedule.map(part => (
                  <li key={part.monthOffset}>
                    {part.monthOffset === 0
                      ? "At checkout"
                      : `${part.monthOffset} calendar month(s) after deposit`}
                    {": "}{money(part.amountCents)}
                    {part.administrationFeeCents > 0 &&
                      `, including ${money(part.administrationFeeCents)} administration`}
                  </li>
                ))}
              </ul>

              <section className="mt-6 border-t pt-5">
                <h2 className="text-xl font-semibold">
                  Parent enrolment terms
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Version {d.terms.version}
                </p>
                {d.terms.sections.map((section, index) => (
                  <div key={index} className="mt-5">
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="mt-2 leading-relaxed">{section.text}</p>
                  </div>
                ))}
              </section>

              {acceptedAt ? (
                <div
                  role="status"
                  className="mt-6 rounded-lg bg-green-50 p-5"
                >
                  <p className="font-semibold">Acceptance recorded</p>
                  <p className="mt-2">
                    {new Date(acceptedAt).toLocaleString("en-AU")}
                  </p>
                  <p className="mt-2">
                    Payment remains unpaid. Course access is locked.
                  </p>
                                    {window.location.origin ===
                    "https://schrool-platform-staging-3583c1139100.herokuapp.com" && (
                    <>
                      <button
                        type="button"
                        onClick={openCheckout}
                        disabled={checkout.isPending}
                        className="mt-4 rounded-lg bg-[#1560B0] px-6 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {checkout.isPending
                          ? "Opening Stripe…"
                          : `Pay ${money(d.quote.dueNowCents)} in Stripe test mode`}
                      </button>
                      {checkout.error && (
                        <p role="alert" className="mt-3 text-red-800">
                          {checkout.error.message}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 border-t pt-5">
                  <fieldset
                    disabled={acceptance.isPending}
                    className="space-y-5"
                  >
                    <legend className="mb-4 text-xl font-semibold">
                      Confirm your acceptance
                    </legend>

                    <label className="block font-medium">
                      Your full name
                      <input
                        className="mt-2 block w-full rounded-lg border p-3"
                        required
                        minLength={2}
                        maxLength={255}
                        autoComplete="name"
                        value={acceptedName}
                        onChange={event =>
                          setAcceptedName(event.target.value)
                        }
                      />
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        required
                        checked={confirmsAuthority}
                        onChange={event =>
                          setConfirmsAuthority(event.target.checked)
                        }
                      />
                      <span>
                        I am the parent or guardian authorised to enter
                        this agreement for the named student.
                      </span>
                    </label>

                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        required
                        checked={acceptsAgreement}
                        onChange={event =>
                          setAcceptsAgreement(event.target.checked)
                        }
                      />
                      <span>
                        I have reviewed and accept the enrolment details,
                        total price, payment schedule and terms shown above.
                      </span>
                    </label>

                    <button
                      type="submit"
                      disabled={
                        !confirmsAuthority || !acceptsAgreement ||
                        acceptedName.trim().length < 2
                      }
                      className="rounded-lg bg-[#1560B0] px-6 py-3 font-semibold text-white disabled:opacity-50"
                    >
                      {acceptance.isPending
                        ? "Recording acceptance…"
                        : "Accept enrolment agreement"}
                    </button>
                  </fieldset>

                  {acceptance.error && (
                    <p role="alert" className="mt-4 text-red-800">
                      {acceptance.error.message}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
