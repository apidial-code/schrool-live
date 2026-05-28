import { ENV } from './_core/env.js';
import jwt from 'jsonwebtoken';
let _db = null;
export async function getDb() {
    if (_db)
        return _db;
    console.log("[Database] MOCK_DB_ENABLED is true, returning mock database.");
    _db = {
        query: {
            diagnosticTestResults: {
                findFirst: async () => null,
            },
            enrollments: {
                findFirst: async () => {
                    const data = global.mockData?.['enrollments'] || [];
                    return data.length > 0 ? data[data.length - 1] : null;
                }
            }
        },
        insert: (table) => ({
            values: (data) => {
                console.log(`[MockDB] Inserting into ${table?.name || 'table'}:`, data);
                const id = Math.floor(Math.random() * 10000);
                if (!global.mockData)
                    global.mockData = {};
                const tableName = table?.name || 'enrollments';
                if (!global.mockData[tableName])
                    global.mockData[tableName] = [];
                const record = { ...data, id, enrolledAt: new Date() };
                global.mockData[tableName].push(record);
                return [{ insertId: id }];
            }
        }),
        update: (table) => ({
            set: (data) => ({
                where: () => ({
                    execute: async () => {
                        console.log(`[MockDB] Updating ${table?.name || 'table'} with:`, data);
                    }
                }),
            }),
        }),
        select: () => ({
            from: (table) => ({
                where: (condition) => ({
                    limit: async (num) => {
                        const tableName = table?.name || 'enrollments';
                        const data = global.mockData?.[tableName] || [];
                        if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
                            const users = global.mockData?.users || [];
                            if (users.length > 0)
                                return [users[users.length - 1]];
                            return [{ id: 1, openId: 'mock_open_id', name: 'Mock User', role: 'student', email: 'student@test.com' }];
                        }
                        return data.length > 0 ? [data[data.length - 1]] : [];
                    },
                    orderBy: (column) => ({
                        limit: async (num) => {
                            const tableName = table?.name || 'enrollments';
                            const data = global.mockData?.[tableName] || [];
                            return data.length > 0 ? [data[data.length - 1]] : [];
                        },
                    }),
                }),
                orderBy: (column) => ({
                    limit: async (num) => {
                        const tableName = table?.name || 'enrollments';
                        const data = global.mockData?.[tableName] || [];
                        if (tableName === 'users' || table?.name === 'users' || table?.config?.name === 'users') {
                            const users = global.mockData?.users || [];
                            if (users.length > 0)
                                return [users[users.length - 1]];
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
export async function upsertUser(user) {
    const db = await getDb();
    if (!db)
        return;
    console.log("[MockDB] upsertUser:", user);
}
export async function getUserByOpenId(openId) {
    const db = await getDb();
    if (!db)
        return undefined;
    return { id: 1, openId, name: "Mock User" };
}
export async function getUserByEmail(email) {
    const db = await getDb();
    if (!db)
        return undefined;
    const data = global.mockData?.['users'] || [];
    return data.find((u) => u.email === email) || { id: 1, email, name: "Mock User", role: "student", openId: "mock_open_id" };
}
export async function createUser(data) {
    const db = await getDb();
    const id = Math.floor(Math.random() * 1000);
    console.log("[MockDB] createUser:", data);
    return { id, ...data };
}
export async function createEnrollment(data) {
    const db = await getDb();
    const id = Math.floor(Math.random() * 1000);
    console.log("[MockDB] createEnrollment:", data);
    if (!global.mockData)
        global.mockData = {};
    if (!global.mockData['enrollments'])
        global.mockData['enrollments'] = [];
    const record = { ...data, id, enrolledAt: new Date() };
    global.mockData['enrollments'].push(record);
    return record;
}
export async function getEnrollmentByUserId(userId) {
    const db = await getDb();
    if (!db)
        return undefined;
    const data = global.mockData?.['enrollments'] || [];
    return data.find((e) => e.userId === userId) || data[0];
}
export async function getEnrollmentByStripeSubscription(stripeSubscriptionId) {
    return null;
}
export async function updateEnrollment(enrollmentId, data) {
    console.log(`[MockDB] updateEnrollment ${enrollmentId}:`, data);
}
export async function generateMagicLinkToken(userId, userType) {
    return jwt.sign({ userId, userType }, ENV.cookieSecret || 'demo-secret', { expiresIn: '7d' });
}
export async function getAllLessons() {
    const data = global.mockData?.lessons || [];
    return data;
}
export async function getLessonById(lessonId) {
    return undefined;
}
export async function getExercisesByLessonId(lessonId) {
    return [];
}
export async function getUserProgress(userId) {
    return [];
}
export async function getLessonProgress(userId, lessonId) {
    return undefined;
}
export async function updateLessonProgress(userId, lessonId, data) {
    console.log(`[MockDB] updateLessonProgress for user ${userId}, lesson ${lessonId}:`, data);
}
export async function canProgressToLesson(userId, lessonId) {
    return true;
}
export async function getTeachers() {
    return [{ id: 1, name: "Mock Teacher", email: "teacher@example.com" }];
}
export async function getCourseIdByYearLevel(yearLevel) {
    return 1;
}
export async function getDiagnosticResultByEmail(email) {
    return null;
}
export async function linkParentAndStudent(parentId, studentId) {
    console.log(`[MockDB] linkParentAndStudent: parent ${parentId}, student ${studentId}`);
}
export async function getCourseById(courseId) {
    return { id: courseId, title: "Mock Course" };
}
export async function getLessonsByCourseId(courseId) {
    const data = global.mockData?.lessons || [];
    return data.filter((l) => l.courseId === courseId);
}
