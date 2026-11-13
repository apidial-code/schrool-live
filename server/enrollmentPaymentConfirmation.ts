import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { addYears } from "date-fns";
import {
  courses, enrollments, enrollmentPayments, users,
} from "../drizzle/schema.js";
import { getDb } from "./db.js";
import { getTestStripe } from "./_core/stripeTest.js";
import { enrollmentSnapshotSchema } from "./enrollmentAgreement.js";

export async function recordInitialTestPayment(sessionId: string) {
  if (!/^cs_test_[A-Za-z0-9]+$/.test(sessionId)) {
    throw new Error("Invalid sandbox checkout reference.");
  }

  const stripe = getTestStripe();
  const session = await stripe.checkout.sessions.retrieve(
    sessionId,
    { expand: ["payment_intent"] },
  );

  const intent = session.payment_intent;

  if (
    session.livemode ||
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid" ||
    session.metadata?.purpose !== "initial_enrollment" ||
    !intent ||
    typeof intent === "string" ||
    intent.livemode ||
    intent.status !== "succeeded"
  ) {
    throw new Error("Completed sandbox payment required.");
  }

  const enrollmentId = Number(session.client_reference_id);
  const attemptKey = session.metadata?.attemptKey;

  if (
    !Number.isSafeInteger(enrollmentId) ||
    enrollmentId <= 0 ||
    !attemptKey
  ) {
    throw new Error("Payment references are missing.");
  }

  const db = await getDb();

  return db.transaction(async (tx: any) => {
    const [row] = await tx.select().from(enrollments)
      .where(eq(enrollments.id, enrollmentId))
      .limit(1).for("update");

    const [payment] = await tx.select().from(enrollmentPayments)
      .where(eq(enrollmentPayments.attemptKey, attemptKey))
      .limit(1).for("update");

    if (!row || !payment || !row.acceptedAt) {
      throw new Error("Accepted enrolment and payment attempt required.");
    }

    const stored = JSON.parse(row.agreementSnapshot || "null");
    const snapshot = enrollmentSnapshotSchema.parse(stored);
    const reviewDigest = createHash("sha256")
      .update(JSON.stringify(snapshot)).digest("hex");

    if (
      !snapshot.terms ||
      stored.parentAccepted !== true ||
      stored.acceptance?.acceptsAgreement !== true ||
      stored.acceptance?.confirmsAuthority !== true ||
      stored.acceptance?.reviewDigest !== reviewDigest ||
      stored.acceptance?.termsVersion !== snapshot.terms.version ||
      row.termsVersion !== snapshot.terms.version ||
      row.parentEmail !== snapshot.family.parentEmail ||
      row.tier !== snapshot.quote.tier ||
      row.paymentPlan !== snapshot.quote.paymentOption ||
      row.currency !== "AUD" ||
      row.agreedTotalCents !== snapshot.quote.totalPayableCents ||
      payment.enrollmentId !== enrollmentId ||
      payment.activeKey !== `initial:${enrollmentId}` ||
      payment.livemode !== false ||
      !["creating", "open", "paid"].includes(payment.status) ||
      payment.reviewDigest !== reviewDigest ||
      session.metadata?.reviewDigest !== reviewDigest ||
      session.metadata?.enrollmentId !== String(enrollmentId) ||
      intent.metadata?.enrollmentId !== String(enrollmentId) ||
      intent.metadata?.attemptKey !== attemptKey ||
      payment.amountCents !== snapshot.quote.dueNowCents ||
      session.amount_total !== payment.amountCents ||
      intent.amount !== payment.amountCents ||
      intent.amount_received !== payment.amountCents ||
      payment.currency !== "AUD" ||
      session.currency !== "aud" ||
      intent.currency !== "aud" ||
      (payment.stripeCheckoutSessionId &&
        payment.stripeCheckoutSessionId !== session.id) ||
      (payment.stripePaymentIntentId &&
        payment.stripePaymentIntentId !== intent.id)
    ) {
      throw new Error("Payment does not match the accepted agreement.");
    }

    const paidAt = payment.paidAt ?? new Date();
          if (
      row.yearLevel === "year5-6" &&
      (row.tier === "standard" || row.tier === "elite") &&
      row.status === "draft" &&
      row.paymentStatus === "unpaid" &&
      row.studentId == null &&
      row.activatedAt == null
    ) {
      const [course] = await tx.select({
        id: courses.id,
        title: courses.title,
      }).from(courses)
        .where(eq(courses.id, 2))
        .limit(1);

      if (course?.title !== "Math I Year 5/6") {
        throw new Error("The staging course access test record is unavailable.");
      }

      const studentEmail = snapshot.family.studentEmail.trim().toLowerCase();

      await tx.insert(users).values({
        name: snapshot.family.studentName,
        email: studentEmail,
        role: "student",
        accountStatus: "active",
      }).onDuplicateKeyUpdate({
        set: { email: studentEmail },
      });

      const [student] = await tx.select({
        id: users.id,
        role: users.role,
        accountStatus: users.accountStatus,
      }).from(users)
        .where(eq(users.email, studentEmail))
        .limit(1).for("update");

      if (student?.role !== "student" || student.accountStatus !== "active") {
        throw new Error("The enrolment email must belong to an active student account.");
      }

      const activatedAt = new Date();

      await tx.update(enrollments).set({
        studentId: student.id,
        courseId: course.id,
        status: "active",
        paymentStatus: "paid",
        activatedAt,
        accessEndsAt: addYears(activatedAt, 1),
      }).where(eq(enrollments.id, enrollmentId));
    }
    await tx.update(enrollmentPayments).set({
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: intent.id,
      status: "paid",
      paidAt,
    }).where(eq(enrollmentPayments.id, payment.id));

    return {
      enrollmentId,
      paymentId: Number(payment.id),
      paidAt: paidAt.toISOString(),
    };
  });
}
