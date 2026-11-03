// Server-only catalogue. Never import this module into src/ or shared/.
// Elite quotes must be returned only by an authorised enrolment endpoint.
export type EnrollmentTier = "standard" | "elite";
export type PaymentOption = "full" | "deposit50" | "deposit25";
export const ENROLLMENT_CATALOG_VERSION = "Y56-2026-11-03-v1";

export interface PaymentPart {
  monthOffset: number;
  courseAmountCents: number;
  administrationFeeCents: number;
  amountCents: number;
}

export function getYear56Quote(tier: EnrollmentTier, option: PaymentOption) {
  if (tier !== "standard" && tier !== "elite") {
    throw new Error("Invalid enrolment product.");
  }
  const basePriceCents = tier === "standard" ? 74900 : 598700;
  const schedule: PaymentPart[] = [];
  const add = (monthOffset: number, courseAmountCents: number, administrationFeeCents = 0) => {
    schedule.push({ monthOffset, courseAmountCents, administrationFeeCents,
      amountCents: courseAmountCents + administrationFeeCents });
  };
  if (option === "full") {
    add(0, Math.round(basePriceCents * 95 / 100));
  } else if (option === "deposit50") {
    const deposit = Math.round(basePriceCents / 2);
    add(0, deposit);
    const remaining = basePriceCents - deposit;
    if (tier === "standard") {
      add(1, remaining, 3000);
    } else {
      const first = Math.round(remaining / 2);
      add(1, first, 3000);
      add(2, remaining - first, 3000);
    }
  } else if (option === "deposit25" && tier === "elite") {
    const deposit = Math.round(basePriceCents / 4);
    add(0, deposit);
    const remaining = basePriceCents - deposit;
    const instalment = Math.round(remaining / 5);
    for (let month = 1; month <= 5; month++) {
      add(month, month === 5 ? remaining - instalment * 4 : instalment, 3000);
    }
  } else {
    throw new Error("This payment option is not available for the selected product.");
  }
  return {
    catalogVersion: ENROLLMENT_CATALOG_VERSION,
    courseKey: "year5-6" as const,
    courseName: "Math I Year 5/6",
    tier,
    paymentOption: option,
    currency: "AUD" as const,
    lessonCount: 23,
    accessMonthsFromEnrolment: tier === "standard" ? 12 : null,
    sessionsPerLesson: tier === "elite" ? 2 : 0,
    weeklySessions: tier === "elite" ? 2 : 0,
    includedZoomSessions: tier === "elite" ? 46 : 0,
    studentCreatedQuestionsPerLesson: tier === "elite" ? 5 : 0,
    requiresTutorApproval: tier === "elite",
    phoneSupport: tier === "standard"
      ? { months: 3, minutesPerWeek: 30, unusedMinutesAccumulate: false }
      : null,
    extraSessionPolicy: tier === "elite"
      ? "Tutor explains the need through internal parent messaging. Parent agrees to the fee and time. A linked administrator note is recorded. The additional session supplements the regular schedule and is invoiced after completion."
      : null,
    basePriceCents,
    discountCents: option === "full" ? basePriceCents - schedule[0].courseAmountCents : 0,
    administrationFeeTotalCents: schedule.reduce((total, part) => total + part.administrationFeeCents, 0),
    totalPayableCents: schedule.reduce((total, part) => total + part.amountCents, 0),
    dueNowCents: schedule[0].amountCents,
    schedule,
  };
}
