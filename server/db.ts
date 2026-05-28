import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, emailCampaigns, emailSequences, emailQueue, emailLogs, diagnosticTestResults, lessons, exercises, userProgress, courses, enrollments } from "../drizzle/schema";
import { ENV } from './_core/env';
import jwt from 'jsonwebtoken';

let _db: any = null;

export async function getDb() {
  if (_db) return _db;

  if (true) {
    console.log("[Database] MOCK_DB_ENABLED is true, returning mock database.");
    _db = {
      query: {
        diagnosticTestResults: {
          findFirst: async () => null,
        },
        enrollments: {
          findFirst: async () => {
            const data = (global as any).mockData?.['enrollments'] || [];
            return data.length > 0 ? data[data.length - 1] : null;
          }
        }
      },
      insert: (table: any) => ({
        values: (data: any) => {
          console.log(`[MockDB] Inserting into ${table?.name || 'table'}:`, data);
          const id = Math.floor(Math.random() * 10000);
          if (!(global as any).mockData) (global as any).mockData = {};
          const tableName = table?.name || 'enrollments';
          if (!(global as any).mockData[tableName]) (global as any).mockData[tableName] = [];
          const record = { ...data, id, enrolledAt: new Date() };
          (global as any).mockData[tableName].push(record);
          return [{ insertId: id }];
        }
      }),
      update: (table: any) => ({
        set: (data: any) => ({
          where: () => ({
            execute: async () => {
              console.log(`[MockDB] Updating ${table?.name || 'table'} with:`, data);
            }
          }),
        }),
      }),
      select: () => ({
        from: (table: any) => ({
          where: (condition: any) => ({
            limit: async (num: number) => {
              const tableName = table?.name || 'enrollments';
              const data = (global as any).mockData?.[tableName] || [];
              // If we're looking for a specific ID in users table
              if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
                console.log(`[MockDB] Mocking user retrieval for table: ${tableName}`);
                // Try to find the user in mockData first
                const users = (global as any).mockData?.users || [];
                if (users.length > 0) {
                  return [users[users.length - 1]];
                }
                const mockUser = { id: 1, openId: 'mock_open_id', name: 'Mock User', role: 'student', email: 'student@test.com' };
                return [mockUser];
              }
              return data.length > 0 ? [data[data.length - 1]] : [];
            },
            orderBy: (column: any) => ({
              limit: async (num: number) => {
                const tableName = table?.name || 'enrollments';
                const data = (global as any).mockData?.[tableName] || [];
                return data.length > 0 ? [data[data.length - 1]] : [];
              },
            }),
          }),
          orderBy: (column: any) => ({
            limit: async (num: number) => {
              const tableName = table?.name || 'enrollments';
              const data = (global as any).mockData?.[tableName] || [];
              // If we're looking for a specific ID in users table
              if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
                console.log(`[MockDB] Mocking user retrieval for table: ${tableName}`);
                // Try to find the user in mockData first
                const users = (global as any).mockData?.users || [];
                if (users.length > 0) {
                  return [users[users.length - 1]];
                }
                const mockUser = { id: 1, openId: 'mock_open_id', name: 'Mock User', role: 'student', email: 'student@test.com' };
                return [mockUser];
              }
              return data.length > 0 ? [data[data.length - 1]] : [];
            },
          }),
        }),
      }),
    };
    return _db;
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = process.env.DATABASE_URL;
      const pool = mysql.createPool({
        uri: dbUrl,
        ssl: (dbUrl.includes('tidbcloud.com') || dbUrl.includes('ssl=true')) ? { rejectUnauthorized: true } : undefined,
      });
      _db = drizzle(pool);
      return _db;
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
    }
  }

  return null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  console.log("[MockDB] upsertUser:", user);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) return { id: 1, openId, name: "Mock User" };
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) {
    const data = (global as any).mockData?.['users'] || [];
    return data.find((u: any) => u.email === email) || { id: 1, email, name: "Mock User", role: "student", openId: "mock_open_id" };
  }
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(data: any) {
  const db = await getDb();
  const id = Math.floor(Math.random() * 1000);
  console.log("[MockDB] createUser:", data);
  return { id, ...data };
}

export async function createEnrollment(data: any) {
  const db = await getDb();
  const id = Math.floor(Math.random() * 1000);
  console.log("[MockDB] createEnrollment:", data);
  if (!(global as any).mockData) (global as any).mockData = {};
  if (!(global as any).mockData['enrollments']) (global as any).mockData['enrollments'] = [];
  const record = { ...data, id, enrolledAt: new Date() };
  (global as any).mockData['enrollments'].push(record);
  return record;
}

export async function getEnrollmentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) {
    const data = (global as any).mockData?.['enrollments'] || [];
    return data.find((e: any) => e.userId === userId) || data[0];
  }
  const result = await db.select().from(enrollments).where(eq(enrollments.userId, userId)).limit(1);
  return result[0];
}

export async function getEnrollmentByStripeSubscription(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return null;
  if (true) return null;
  const result = await db.select().from(enrollments).where(eq(enrollments.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
  return result[0] || null;
}

export async function updateEnrollment(enrollmentId: number, data: any) {
  const db = await getDb();
  if (!db) return;
  console.log(`[MockDB] updateEnrollment ${enrollmentId}:`, data);
}

export async function generateMagicLinkToken(userId: number, userType: string) {
  return jwt.sign({ userId, userType }, ENV.jwtSecret || 'demo-secret', { expiresIn: '7d' });
}

export async function getAllLessons() {
  const db = await getDb();
  if (!db) return [];
  if (true) {
    return (global as any).mockData?.lessons || [];
  }
  return await db.select().from(lessons).orderBy(lessons.orderIndex);
}

export async function getLessonById(lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, lessonId)).limit(1);
  return result[0];
}

export async function getExercisesByLessonId(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  if (true) return [];
  return await db.select().from(exercises).where(eq(exercises.lessonId, lessonId));
}

export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];
  if (true) return [];
  return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
}

export async function getLessonProgress(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) return undefined;
  const result = await db.select().from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
    .limit(1);
  return result[0];
}

export async function updateLessonProgress(userId: number, lessonId: number, data: any) {
  const db = await getDb();
  if (!db) return;
  console.log(`[MockDB] updateLessonProgress for user ${userId}, lesson ${lessonId}:`, data);
}

export async function canProgressToLesson(userId: number, lessonId: number): Promise<boolean> {
  return true; // Simplified for demo
}

export async function getTeachers() {
  const db = await getDb();
  if (!db) return [];
  if (true) {
    return [{ id: 1, name: "Mock Teacher", email: "teacher@example.com" }];
  }
  return await db.select().from(users).where(eq(users.role, 'teacher'));
}

export async function getCourseIdByYearLevel(yearLevel: string) {
  return 1; // Simplified for demo
}

export async function getDiagnosticResultByEmail(email: string) {
  return null; // Simplified for demo
}

export async function linkParentAndStudent(parentId: number, studentId: number) {
  console.log(`[MockDB] linkParentAndStudent: parent ${parentId}, student ${studentId}`);
}

export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return undefined;
  if (true) return { id: courseId, title: "Mock Course" };
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result[0];
}

export async function getLessonsByCourseId(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  if (true) {
    const data = (global as any).mockData?.lessons || [];
    return data.filter((l: any) => l.courseId === courseId);
  }
  return await db.select().from(lessons).where(eq(lessons.courseId, courseId)).orderBy(lessons.orderIndex);
}
