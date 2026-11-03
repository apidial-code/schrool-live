import React, { useRef, useState } from "react";
import { trpc } from "../lib/trpc";

type Tier = "standard" | "elite";
type PaymentOption = "full" | "deposit50" | "deposit25";
const field = "mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-slate-900 focus:border-[#1560B0] focus:outline-none focus:ring-2 focus:ring-blue-100";
const primary = "rounded-lg bg-[#1560B0] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "rounded-lg border border-slate-300 px-5 py-3 font-medium";
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const money = (cents: number) => new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(cents / 100);
function Notice({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900"><section className="mx-auto max-w-xl rounded-xl border bg-white p-8 shadow-sm">{children}</section></main>;
}
export default function EnrollmentWorkspace() {
  const session = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: "always" });
  if (session.isLoading || (session.isFetching && !session.data)) return <Notice><p role="status">Checking enrolment access…</p></Notice>;
  if (session.error) return <Notice><h1 className="text-xl font-semibold">Unable to check access</h1><button className={`${secondary} mt-4`} onClick={() => session.refetch()}>Try again</button></Notice>;
  if (!session.data) return <Notice><h1 className="text-xl font-semibold">Consultant sign in</h1><p className="mt-3">Please sign in with your consultant account to prepare an enrolment.</p><a className="mt-4 inline-block text-[#1560B0] underline" href="/login">Go to sign in</a></Notice>;
  if (session.data.accountStatus !== "active" || !["consultant", "admin"].includes(session.data.role)) return <Notice><h1 className="text-xl font-semibold">Consultant access required</h1><p className="mt-3">This workspace is for authorised consultants and administrators.</p><a href="/" className="mt-4 inline-block underline">Return home</a></Notice>;
  return <>{session.isFetching && <Notice><p role="status">Checking enrolment access…</p></Notice>}<div hidden={session.isFetching}><EnrolmentForm /></div></>;
}
function EnrolmentForm() {
  const [tier, setTier] = useState<Tier>(() => window.location.pathname === "/enroll/elite" ? "elite" : "standard");
  const [paymentOption, setPaymentOption] = useState<PaymentOption>("full");
  const [review, setReview] = useState(false);
  const [error, setError] = useState("");
  const reviewRef = useRef<HTMLDivElement>(null);
  const [family, setFamily] = useState({ studentName: "", studentEmail: "", studentAge: "", parentName: "", parentEmail: "", phone: "" });
  const [preferences, setPreferences] = useState({ day1: "", time1: "", day2: "", time2: "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Sydney" });
  const quote = trpc.enrollmentNew.getQuote.useQuery({ courseKey: "year5-6", tier, paymentOption }, {
    retry: false, staleTime: 0, gcTime: 0, refetchOnWindowFocus: "always",
  });
  const q = quote.data;
  const quoteReady = !!q && !quote.error && !quote.isFetching && q.tier === tier && q.paymentOption === paymentOption;
  const update = (name: keyof typeof family, value: string) => { setFamily(f => ({ ...f, [name]: value })); setReview(false); setError(""); };
  const preference = (name: keyof typeof preferences, value: string) => { setPreferences(p => ({ ...p, [name]: value })); setReview(false); setError(""); };
  function selectTier(value: Tier) {
    setTier(value); setPaymentOption("full"); setReview(false); setError("");
  }
  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (!quoteReady) { setError("Wait for the selected package quote before reviewing."); return; }
    if (family.studentEmail.trim().toLowerCase() === family.parentEmail.trim().toLowerCase()) {
      setError("Use separate student and parent email addresses so each account has its own sign-in access."); return;
    }
    if (tier === "elite") {
      if (!preferences.day1 || !preferences.day2 || preferences.day1 === preferences.day2 || !preferences.time1 || !preferences.time2) {
        setError("Choose two different session days and a preferred time for each."); return;
      }
      try { new Intl.DateTimeFormat("en-AU", { timeZone: preferences.timezone }).format(); }
      catch { setError("Enter a valid time zone, for example Australia/Sydney."); return; }
    }
    setReview(true);
    requestAnimationFrame(() => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  return <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-5xl">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <a href="/" className="text-3xl font-bold text-[#1560B0]" aria-label="Schrool home">Sch<span className="text-[#FF7A00]">r</span>ool</a>
        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-[#1560B0]">Consultant enrolment workspace</span>
      </header>
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">Staging preview: review the form and package figures. Details entered here are not saved; no payment is taken or course access activated.</div>
      <h1 className="text-3xl font-bold">Prepare an enrolment</h1>
      <p className="mt-2 text-slate-600">Select the package, confirm family details and review the payment breakdown.</p>
      <form onSubmit={handleReview} className="mt-7 space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">1. Course and package</h2>
          <label className="mt-5 block font-medium" htmlFor="course">Course</label>
          <select id="course" className={field} value="year5-6" onChange={() => {}}><option value="year5-6">Math I Year 5/6 · 23 lessons</option></select>
          <fieldset className="mt-5"><legend className="font-medium">Package</legend>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">{(["standard", "elite"] as const).map(value =>
              <label key={value} className={`cursor-pointer rounded-lg border p-5 ${tier === value ? "border-[#1560B0] bg-blue-50" : "border-slate-200"}`}>
                <span className="flex items-center gap-3"><input type="radio" name="tier" value={value} checked={tier === value} onChange={() => selectTier(value)} /><strong className="text-lg">{value === "standard" ? "Standard" : "Elite · 5QHackMath"}</strong></span>
                <span className="mt-3 block text-sm leading-relaxed">{value === "standard"
                  ? "Independent learning with video lessons, exercises, worked solutions and saved progress. Pass each difficulty at 80% to progress."
                  : "Tutor-guided learning with two Zoom sessions per lesson and five student-created questions with worked answers. Tutor approval is required to progress."}</span>
              </label>)}</div>
          </fieldset>
          {quoteReady && <div className="mt-5 rounded-lg bg-slate-50 p-5">
            <h3 className="font-semibold">Included in this package</h3>
            {tier === "standard" ? <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
              <li>All {q!.lessonCount} lessons, with Easy, Medium and Challenging exercises.</li>
              <li>{q!.accessMonthsFromEnrolment} months of access from enrolment for the named student, including revision.</li>
              <li>Up to {q!.phoneSupport?.minutesPerWeek} minutes of phone assistance per week for the first {q!.phoneSupport?.months} months. Unused minutes do not accumulate.</li>
              <li>No five-question submission or tutor-approval requirement.</li>
            </ul> : <><ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
              <li>{q!.lessonCount} lessons × {q!.sessionsPerLesson} Zoom sessions = <strong>{q!.includedZoomSessions} included sessions</strong>.</li>
              <li>Normally {q!.weeklySessions} sessions per week, giving {q!.lessonCount} planned teaching weeks. Agreed pauses and scheduling changes can affect the finish date.</li>
              <li>Five student-created questions with worked answers per lesson, guided and approved by the tutor.</li>
            </ul><p className="mt-4 text-sm leading-relaxed"><strong>Additional sessions: </strong>{q!.extraSessionPolicy} The extra-session fee must be confirmed before the parent agrees.</p></>}
          </div>}
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">2. Student and parent details</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="font-medium">Student full name<input className={field} autoComplete="off" required maxLength={255} value={family.studentName} onChange={e => update("studentName", e.target.value)} /></label>
            <label className="font-medium">Student sign-in email<input className={field} type="email" autoComplete="off" required maxLength={255} value={family.studentEmail} onChange={e => update("studentEmail", e.target.value)} /></label>
            <label className="font-medium">Student age<input className={field} type="number" min="1" max="99" required value={family.studentAge} onChange={e => update("studentAge", e.target.value)} /></label>
            <div className="self-center text-sm text-slate-600">The enrolment and learning history belong to this named student. Siblings need separate enrolments.</div>
            <label className="font-medium">Parent or guardian full name<input className={field} autoComplete="off" required maxLength={255} value={family.parentName} onChange={e => update("parentName", e.target.value)} /></label>
            <label className="font-medium">Parent sign-in email<input className={field} type="email" autoComplete="off" required maxLength={255} value={family.parentEmail} onChange={e => update("parentEmail", e.target.value)} /></label>
            <label className="font-medium">Parent phone number<input className={field} type="tel" required maxLength={50} value={family.phone} onChange={e => update("phone", e.target.value)} /></label>
          </div>
        </section>
        {tier === "elite" && <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">3. Preferred Zoom times</h2>
          <p className="mt-2 text-sm text-slate-600">Preferences are subject to tutor availability. The final schedule will be confirmed with the family.</p>
          <label className="mt-4 block font-medium">Family time zone<input className={field} required maxLength={100} value={preferences.timezone} onChange={e => preference("timezone", e.target.value)} /><span className="mt-1 block text-sm font-normal text-slate-600">For example, Australia/Sydney. Both preferred times below use this time zone.</span></label>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">{([1, 2] as const).map(n => <div key={n} className="rounded-lg border border-slate-200 p-4">
            <label className="font-medium">Session {n} day<select className={field} required value={preferences[n === 1 ? "day1" : "day2"]} onChange={e => preference(n === 1 ? "day1" : "day2", e.target.value)}>
              <option value="">Choose a day</option>{days.map(day => <option key={day} value={day} disabled={preferences[n === 1 ? "day2" : "day1"] === day}>{day}</option>)}</select></label>
            <label className="mt-4 block font-medium">Preferred start time<input className={field} type="time" required value={preferences[n === 1 ? "time1" : "time2"]} onChange={e => preference(n === 1 ? "time1" : "time2", e.target.value)} /></label>
          </div>)}</div>
        </section>}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-xl font-semibold">{tier === "elite" ? "4" : "3"}. Payment arrangement</h2>
          <fieldset className="mt-5 space-y-3"><legend className="sr-only">Payment option</legend>
            {(["full", "deposit50", ...(tier === "elite" ? ["deposit25"] : [])] as PaymentOption[]).map(option => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${paymentOption === option ? "border-[#1560B0] bg-blue-50" : "border-slate-200"}`}>
              <input className="mt-1" type="radio" name="payment" checked={paymentOption === option} onChange={() => { setPaymentOption(option); setReview(false); }} />
              <span><strong>{option === "full" ? "Full payment · 5% discount" : option === "deposit50" ? "50% deposit" : "25% deposit"}</strong><span className="mt-1 block text-sm text-slate-600">{option === "full" ? "One payment, with no instalment administration fee." : option === "deposit50" ? tier === "standard" ? "Remaining 50% one calendar month later, plus one $30 administration fee." : "Two monthly instalments of 25%, each with a $30 administration fee." : "Five monthly instalments of 15%, each with a $30 administration fee."}</span></span>
            </label>)}
          </fieldset>
          {quote.isFetching ? <p role="status" className="mt-5">Calculating your selected quote…</p>
            : quote.error ? <div role="alert" className="mt-5 rounded-lg bg-red-50 p-4"><p>{quote.error.message}</p><button type="button" className={`${secondary} mt-3`} onClick={() => quote.refetch()}>Retry quote</button></div>
            : quoteReady && <div className="mt-6">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div><dt className="text-sm text-slate-600">Base course price</dt><dd className="text-xl font-semibold">{money(q!.basePriceCents)}</dd></div>
                <div><dt className="text-sm text-slate-600">Full-payment discount</dt><dd className="text-xl font-semibold">{money(q!.discountCents)}</dd></div>
                <div><dt className="text-sm text-slate-600">Total administration fees</dt><dd className="text-xl font-semibold">{money(q!.administrationFeeTotalCents)}</dd></div>
                <div><dt className="text-sm text-slate-600">Total payable · AUD</dt><dd className="text-2xl font-bold text-[#1560B0]">{money(q!.totalPayableCents)}</dd></div>
              </dl>
              <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><caption className="mb-3 text-left font-semibold">Payment breakdown</caption>
                <thead><tr className="border-b"><th className="p-3">Due</th><th className="p-3">Course amount</th><th className="p-3">Administration</th><th className="p-3">Payment</th></tr></thead>
                <tbody>{q!.schedule.map(part => <tr className="border-b" key={part.monthOffset}><td className="p-3">{part.monthOffset === 0 ? "At checkout" : `${part.monthOffset} calendar month${part.monthOffset === 1 ? "" : "s"} after deposit`}</td><td className="p-3">{money(part.courseAmountCents)}</td><td className="p-3">{money(part.administrationFeeCents)}</td><td className="p-3 font-semibold">{money(part.amountCents)}</td></tr>)}</tbody>
              </table></div>
              <p className="mt-3 text-sm text-slate-600">All amounts are AUD. Exact payment dates and the full agreement must be shown to the parent before acceptance.</p>
            </div>}
        </section>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</p>}
        <button className={primary} disabled={!quoteReady} type="submit">Review enrolment</button>
      </form>
      {review && quoteReady && <section ref={reviewRef} tabIndex={-1} className="mt-7 scroll-mt-5 rounded-xl border border-blue-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-[#1560B0]">Enrolment review</h2>
        <dl className="mt-5 space-y-3">
          <div><dt className="font-semibold">Course</dt><dd>{q!.courseName} · {tier === "elite" ? "Elite" : "Standard"}</dd></div>
          <div><dt className="font-semibold">Student</dt><dd>{family.studentName.trim()}, age {family.studentAge} · {family.studentEmail.trim()}</dd></div>
          <div><dt className="font-semibold">Parent or guardian</dt><dd>{family.parentName.trim()} · {family.parentEmail.trim()} · {family.phone.trim()}</dd></div>
          {tier === "elite" && <div><dt className="font-semibold">Preferred sessions · {preferences.timezone}</dt><dd>{preferences.day1} at {preferences.time1}; {preferences.day2} at {preferences.time2}. Subject to confirmation.</dd></div>}
          <div><dt className="font-semibold">Total payable</dt><dd>{money(q!.totalPayableCents)} AUD; {money(q!.dueNowCents)} at checkout.</dd></div>
        </dl>
        <p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-sm">Review only. This preview has not saved an enrolment, sent an invitation or initiated payment. Parent acceptance and payment will be connected after this form is checked.</p>
        <button type="button" className={`${secondary} mt-4`} onClick={() => { setReview(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit details</button>
      </section>}
    </div>
  </main>;
}
