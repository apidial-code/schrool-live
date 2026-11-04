// Draft terms for staging acceptance tests.
// Preserve each accepted version in the enrolment agreement snapshot.
export const ENROLLMENT_TERMS_VERSION = "2026-11-04-staging-v1";

export function getEnrollmentTerms(tier: "standard" | "elite") {
  const sections = [
    {
      title: "Your enrolment package",
      text:
        "Your enrolment summary identifies the student, course, package, " +
        "included services, total price and payment schedule. " +
        "Please check these details before accepting.",
    },
    {
      title: "Payments",
      text:
        "Your deposit is credited towards the total package price. " +
        "Instalments spread the cost of the agreed package. " +
        "You agree to pay the amounts shown on the payment schedule.",
    },
    {
      title: "Withdrawal and changes",
      text:
        "Please submit withdrawal, pause and rescheduling requests in writing. " +
        "Loss of interest, holidays, missed sessions and changes in personal " +
        "or financial circumstances do not, by themselves, entitle you to a " +
        "refund, credit or postponement. Unless Schrool agrees to a change " +
        "in writing or the law provides otherwise, the agreed payment " +
        "schedule continues while the enrolment remains in effect.",
    },
    {
      title: "Early withdrawal",
      text:
        "For voluntary early withdrawal, Schrool will provide a written " +
        "breakdown of amounts it proposes to retain or collect. These may " +
        "include amounts properly owed for services already supplied and " +
        "reasonable costs or losses directly resulting from withdrawal, " +
        "including reserved tutor time that cannot reasonably be reassigned. " +
        "Schrool will account for costs saved or recovered, apply payments " +
        "already received and refund any excess. Families experiencing " +
        "financial hardship may request a revised payment schedule.",
    },
    {
      title: "Learning resources",
      text:
        "Course access and resources are for the named student's personal " +
        "learning use during the agreed access period. Please do not share " +
        "account credentials, redistribute resources or publish course content.",
    },
  ];

  if (tier === "elite") {
    sections.push({
      title: "Missed tutoring sessions and replacements",
      text:
        "If your child will miss a scheduled tutoring session, notify the " +
        "tutor through the parent dashboard. The tutor will propose a " +
        "one-hour replacement within two weeks of the original session, " +
        "subject to availability. The original session remains part of " +
        "your package. A replacement costs an additional $80 AUD. " +
        "You must approve the replacement time and fee in the dashboard " +
        "before it is booked. Once delivered, Schrool will charge a payment " +
        "method you have authorised for that charge or issue an invoice " +
        "payable within seven days of issue. The tutor will record completion " +
        "and notify administration through the platform.",
    });
  }

  sections.push({
    title: "Your consumer rights",
    text:
      "These terms preserve all rights and remedies that cannot be excluded " +
      "under the Australian Consumer Law, including any applicable " +
      "cooling-off rights.",
  });

  return {
    version: ENROLLMENT_TERMS_VERSION,
    sections,
  };
}
