import { InsertUser } from "../drizzle/schema.js";
export declare function getDb(): Promise<any>;
export declare function upsertUser(user: InsertUser): Promise<void>;
export declare function getUserByOpenId(openId: string): Promise<{
    id: number;
    openId: string;
    name: string;
} | undefined>;
export declare function getUserByEmail(email: string): Promise<any>;
export declare function createUser(data: any): Promise<any>;
export declare function createEnrollment(data: any): Promise<any>;
export declare function getEnrollmentByUserId(userId: number): Promise<any>;
export declare function getEnrollmentByStripeSubscription(stripeSubscriptionId: string): Promise<null>;
export declare function updateEnrollment(enrollmentId: number, data: any): Promise<void>;
export declare function generateMagicLinkToken(userId: number, userType: string): Promise<string>;
export declare function getAllLessons(): Promise<any>;
export declare function getLessonById(lessonId: number): Promise<undefined>;
export declare function getExercisesByLessonId(lessonId: number): Promise<never[]>;
export declare function getUserProgress(userId: number): Promise<never[]>;
export declare function getLessonProgress(userId: number, lessonId: number): Promise<undefined>;
export declare function updateLessonProgress(userId: number, lessonId: number, data: any): Promise<void>;
export declare function canProgressToLesson(userId: number, lessonId: number): Promise<boolean>;
export declare function getTeachers(): Promise<{
    id: number;
    name: string;
    email: string;
}[]>;
export declare function getCourseIdByYearLevel(yearLevel: string): Promise<number>;
export declare function getDiagnosticResultByEmail(email: string): Promise<null>;
export declare function linkParentAndStudent(parentId: number, studentId: number): Promise<void>;
export declare function getCourseById(courseId: number): Promise<{
    id: number;
    title: string;
}>;
export declare function getLessonsByCourseId(courseId: number): Promise<any>;
