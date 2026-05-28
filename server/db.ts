import { eq, and, desc } from "drizzle-orm";
import { InsertUser, users, emailCampaigns, emailSequences, emailQueue, emailLogs, diagnosticTestResults, lessons, exercises, userProgress, courses, enrollments } from "../drizzle/schema.js";
import { ENV } from './_core/env.js';
import jwt from 'jsonwebtoken';

let _db: any = null;

export async function getDb() {
  if (_db) return _db;
  
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
            if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
              const users = (global as any).mockData?.users || [];
              if (users.length > 0) return [users[users.length - 1]];
              return [{ id: 1, openId: 'mock_open_id', name: 'Mock User', role: 'student', email: 'student@test.com' }];
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
            if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
              const users = (global as any).mockData?.users || [];
              if (users.length > 0) return [users[users.length - 1]];
              return [{ id: 1, openId: 'mock_open_id', name: 'Mock User', role: 'student', email: 'student@test.com' }];
            }
            return data.length > 0 ? [data[data.length - 1]] : [];
          },
        }),
      }),
    }),
  };
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) return;
  console.log("[MockDB] upsertUser:", user);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  return { id: 1, openId, name: "Mock User" };
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const data = (global as any).mockData?.['users'] || [];
  return data.find((u: any) => u.email === email) || { id: 1, email, name: "Mock User", role: "student", openId: "mock_open_id" };
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
  const data = (global as any).mockData?.['enrollments'] || [];
  return data.find((e: any) => e.userId === userId) || data[0];
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

export async function linkParentAndStudent(parentId: number, studentId: number) {
  console.log(`[MockDB] linkParentAndStudent: parent ${parentId}, student ${studentId}`);
}

export async function getCourseById(courseId: number) {
  return { id: courseId, title: "Mock Course" };
}

export async function getLessonsByCourseId(courseId: number) {
  const data = (global as any).mockData?.lessons || [];
  return data.filter((l: any) => l.courseId === courseId);
}
