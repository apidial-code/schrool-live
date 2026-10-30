import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema.js";
import { eq, and, desc, gte } from "drizzle-orm";
import {
  InsertUser, users, emailCampaigns, emailSequences,
  emailQueue, emailLogs, diagnosticTestResults,
  lessons, exercises, userProgress, courses, enrollments
} from "../drizzle/schema.js";
import { ENV } from "./_core/env.js";
import jwt from "jsonwebtoken";

let databasePromise: Promise<any> | undefined;

export async function getDb(): Promise<any> {
  if (!databasePromise) {
    databasePromise = connectDatabase().catch(() => {
      databasePromise = undefined;
      throw new Error(
        "Secure database connection failed. Check database configuration."
      );
    });
  }
  return databasePromise;
}

async function connectDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required.");

  const url = new URL(databaseUrl);
  if (
    url.protocol !== "mysql:" ||
    !url.hostname ||
    url.pathname.length < 2
  ) {
    throw new Error("Invalid database configuration.");
  }

  const response = await fetch(
    "https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem",
    { signal: AbortSignal.timeout(10000) }
  );
  if (!response.ok) {
    throw new Error("Database certificate download failed.");
  }

  const ca = await response.text();
  if (!ca.includes("-----BEGIN CERTIFICATE-----")) {
    throw new Error("Invalid database certificate bundle.");
  }

  const pool = mysql.createPool({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    connectionLimit: 2,
    waitForConnections: true,
    queueLimit: 20,
    connectTimeout: 10000,
    ssl: {
      ca,
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
  });

  try {
    await pool.query("SELECT 1");
    return drizzle(pool, { schema, mode: "default" });
  } catch (error) {
    await pool.end();
    throw error;
  }
}
export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();

  if (!user.email && !user.openId) {
    throw new Error("An email or login identifier is required.");
  }

  // Account roles and activation must be changed through
  // authorised administration, not through a login update.
  const { id, role, accountStatus, ...profile } = user;

  await db.insert(users).values({
    ...profile,
    role: "student",
    accountStatus: "pending",
  }).onDuplicateKeyUpdate({
    set: {
      ...(user.name != null ? { name: user.name } : {}),
    },
  });
}

export async function getUserByOpenId(openId: string) {
  if (!openId) return undefined;

  const db = await getDb();
  const [user] = await db.select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return user;
}

export async function getUserByEmail(email: string) {
  const normalisedEmail = email.trim().toLowerCase();
  if (!normalisedEmail) return undefined;

  const db = await getDb();
  const [user] = await db.select()
    .from(users)
    .where(eq(users.email, normalisedEmail))
    .limit(1);

  return user;
}

export async function createUser(data: {
  name: string;
  email: string;
  role: "student" | "parent";
}) {
  const name = data.name.trim();
  const email = data.email.trim().toLowerCase();

  if (!name || !email) {
    throw new Error("Name and email are required.");
  }

  if (data.role !== "student" && data.role !== "parent") {
    throw new Error("Invalid account role.");
  }

  const db = await getDb();
  const [result] = await db.insert(users).values({
    name,
    email,
    role: data.role,
    accountStatus: "pending",
  });

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, result.insertId))
    .limit(1);

  if (!user) throw new Error("Unable to retrieve created account.");

  return user;
}

export async function createEnrollment(data: any) {
  const parentId = data?.parentId;
  const studentId = data?.studentId;
  const yearLevel = data?.yearLevel;
  const tier = data?.tier;

  if (
    !Number.isSafeInteger(parentId) || parentId <= 0 ||
    !Number.isSafeInteger(studentId) || studentId <= 0 ||
    parentId === studentId
  ) {
    throw new Error("Valid parent and student IDs are required.");
  }

  if (!["year5-6", "year7", "year8", "year9"].includes(yearLevel)) {
    throw new Error("Invalid school year level.");
  }

  if (tier !== "standard" && tier !== "elite") {
    throw new Error("Invalid course tier.");
  }

  const db = await getDb();

  return db.transaction(async (tx: any) => {
    const [parent] = await tx.select().from(users)
      .where(eq(users.id, parentId)).limit(1);

    const [student] = await tx.select().from(users)
      .where(eq(users.id, studentId)).limit(1);

    if (
      !parent || parent.role !== "parent" ||
      !student || student.role !== "student"
    ) {
      throw new Error("Parent or student account not found.");
    }

    const links = schema.parentStudentLinks;

    const [link] = await tx.select().from(links)
      .where(and(
        eq(links.parentId, parentId),
        eq(links.studentId, studentId)
      )).limit(1);

    if (!link || !["pending", "verified"].includes(link.status)) {
      throw new Error("A valid family link is required.");
    }

    const [result] = await tx.insert(enrollments).values({
      userId: studentId,
      parentId,
      studentId,
      studentName: student.name,
      parentEmail: parent.email,
      yearLevel,
      tier,
      status: "draft",
      paymentStatus: "unpaid",
      currency: "AUD",
    });

    const [enrollment] = await tx.select().from(enrollments)
      .where(eq(enrollments.id, result.insertId)).limit(1);

    if (!enrollment) {
      throw new Error("Unable to retrieve enrolment.");
    }

    return enrollment;
  });
}

export async function getEnrollmentByUserId(userId: number) {
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return undefined;
  }

  const db = await getDb();

  const [enrollment] = await db.select()
    .from(enrollments)
    .where(eq(enrollments.studentId, userId))
    .orderBy(desc(enrollments.id))
    .limit(1);

  return enrollment;
}
export async function getEnrollmentByStripeSubscription(stripeSubscriptionId: string) {
  return null;
}

export async function updateEnrollment(enrollmentId: number, data: any) {
  console.log(`[MockDB] updateEnrollment ${enrollmentId}:`, data);
}

export async function generateMagicLinkToken(userId: number, userType: string) {
  return jwt.sign({ userId, userType }, ENV.cookieSecret || 'demo-secret', { expiresIn: '7d' });
}

export async function getAllLessons() {
  const data = (global as any).mockData?.lessons || [];
  return data;
}

export async function getLessonById(lessonId: number) {
  return undefined;
}

export async function getExercisesByLessonId(lessonId: number) {
  return [];
}

export async function getUserProgress(userId: number) {
  return [];
}

export async function getLessonProgress(userId: number, lessonId: number) {
  return undefined;
}

export async function updateLessonProgress(userId: number, lessonId: number, data: any) {
  console.log(`[MockDB] updateLessonProgress for user ${userId}, lesson ${lessonId}:`, data);
}

export async function canProgressToLesson(userId: number, lessonId: number): Promise<boolean> {
  return true;
}

export async function getTeachers() {
  return [{ id: 1, name: "Mock Teacher", email: "teacher@example.com" }];
}

export async function getCourseIdByYearLevel(yearLevel: string) {
  return 1;
}

export async function getDiagnosticResultByEmail(email: string) {
  return null;
}

export async function linkParentAndStudent(
  parentId: number,
  studentId: number
) {
  if (
    !Number.isSafeInteger(parentId) || parentId <= 0 ||
    !Number.isSafeInteger(studentId) || studentId <= 0 ||
    parentId === studentId
  ) {
    throw new Error(
      "Valid, different parent and student IDs are required."
    );
  }

  const db = await getDb();

  return db.transaction(async (tx: any) => {
    const [parent] = await tx.select().from(users)
      .where(eq(users.id, parentId)).limit(1);

    const [student] = await tx.select().from(users)
      .where(eq(users.id, studentId)).limit(1);

    if (!parent || parent.role !== "parent") {
      throw new Error("Parent account not found.");
    }

    if (!student || student.role !== "student") {
      throw new Error("Student account not found.");
    }

    const links = schema.parentStudentLinks;

    await tx.insert(links).values({
      parentId,
      studentId,
      status: "pending",
    }).onDuplicateKeyUpdate({
      set: { parentId },
    });

    const [link] = await tx.select().from(links)
      .where(and(
        eq(links.parentId, parentId),
        eq(links.studentId, studentId)
      )).limit(1);

    if (!link) {
      throw new Error("Unable to retrieve family link.");
    }

    return link;
  });
}

export async function getCourseById(courseId: number) {
  return { id: courseId, title: "Mock Course" };
}

export async function getLessonsByCourseId(courseId: number) {
  const data = (global as any).mockData?.lessons || [];
  return data.filter((l: any) => l.courseId === courseId);
}
export async function saveLoginLink(data: {
  userId: number;
  tokenHash: string;
  rememberDevice: boolean;
}): Promise<boolean> {
  if (
    !Number.isSafeInteger(data.userId) || data.userId <= 0 ||
    !/^[a-f0-9]{64}$/.test(data.tokenHash) ||
    typeof data.rememberDevice !== "boolean"
  ) {
    throw new Error("Invalid sign-in link data.");
  }

  const db = await getDb();
  const links = schema.loginLinks;

  return db.transaction(async (tx: any) => {
    const [user] = await tx.select().from(users)
      .where(eq(users.id, data.userId)).limit(1).for("update");

    if (
      !user || user.accountStatus !== "active" || !user.email ||
      !["student", "parent", "teacher", "consultant", "admin"]
        .includes(user.role)
    ) {
      return false;
    }

    const now = new Date();
    const recentLinks = await tx.select({
      createdAt: links.createdAt,
    })
      .from(links)
      .where(and(
        eq(links.userId, user.id),
        gte(
          links.createdAt,
          new Date(now.getTime() - 60 * 60 * 1000)
        )
      ))
      .orderBy(desc(links.createdAt)).limit(5);

    if (
      recentLinks.length >= 5 ||
      (recentLinks.length > 0 &&
        now.getTime() - recentLinks[0].createdAt.getTime() < 60000)
    ) {
      return false;
    }

    await tx.insert(links).values({
      userId: user.id,
      tokenHash: data.tokenHash,
      rememberDevice:
        ["student", "parent"].includes(user.role) &&
        data.rememberDevice,
      expiresAt: new Date(now.getTime() + 15 * 60 * 1000),
    });

    return true;
  });
}
