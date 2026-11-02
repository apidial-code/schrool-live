import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { enrollments } from "../../drizzle/schema.js";
import { getDb } from "../db.js";
import type { SessionUser } from "./context.js";

export async function requireCourseAccess(
  user: SessionUser | null,
  enrollmentId: number,
) {
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Please sign in.",
    });
  }

  if (user.role !== "student" || user.accountStatus !== "active") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Course access unavailable.",
    });
  }

  if (!Number.isSafeInteger(enrollmentId) || enrollmentId <= 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid enrolment.",
    });
  }

  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to check course access.",
    });
  }

  const [record] = await db
    .select({
      id: enrollments.id,
      courseId: enrollments.courseId,
      status: enrollments.status,
      paymentStatus: enrollments.paymentStatus,
      acceptedAt: enrollments.acceptedAt,
      activatedAt: enrollments.activatedAt,
      accessEndsAt: enrollments.accessEndsAt,
    })
    .from(enrollments)
    .where(and(
      eq(enrollments.id, enrollmentId),
      eq(enrollments.studentId, user.id),
    ))
    .limit(1);

  const now = Date.now();

  if (
    !record ||
    record.status !== "active" ||
    record.paymentStatus !== "paid" ||
    !record.courseId || record.courseId <= 0 ||
    !record.acceptedAt ||
    !Number.isFinite(record.acceptedAt.getTime()) ||
    record.acceptedAt.getTime() > now ||
    !record.activatedAt ||
    !Number.isFinite(record.activatedAt.getTime()) ||
    record.activatedAt.getTime() > now ||
    !record.accessEndsAt ||
    !Number.isFinite(record.accessEndsAt.getTime()) ||
    record.accessEndsAt.getTime() <= now
  ) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Course access unavailable.",
    });
  }

  return {
    enrollmentId: record.id,
    courseId: record.courseId,
  };
}
