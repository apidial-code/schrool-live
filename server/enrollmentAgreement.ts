import { z } from "zod";

const amount = z.number().int().nonnegative();

export const enrollmentTermsSchema = z.object({
  version: z.string().min(1),
  sections: z.array(z.object({
    title: z.string().min(1),
    text: z.string().min(1),
  })).min(1),
});

export const enrollmentSnapshotSchema = z.object({
  snapshotVersion: z.literal(1),
  savedAt: z.string().datetime(),
  terms: enrollmentTermsSchema.optional(),
  family: z.object({
    studentName: z.string(),
    studentEmail: z.string().email(),
    studentAge: z.string(),
    parentName: z.string(),
    parentEmail: z.string().email(),
    phone: z.string(),
  }),
  zoomPreferences: z.object({
    day1: z.string(),
    time1: z.string(),
    day2: z.string(),
    time2: z.string(),
    timezone: z.string(),
  }).nullable(),
  quote: z.object({
    courseName: z.string(),
    tier: z.enum(["standard", "elite"]),
    paymentOption: z.enum(["full", "deposit50", "deposit25"]),
    currency: z.literal("AUD"),
    totalPayableCents: amount,
    dueNowCents: amount,
    schedule: z.array(z.object({
      monthOffset: amount,
      courseAmountCents: amount,
      administrationFeeCents: amount,
      amountCents: amount,
    })).min(1),
  }),
});
