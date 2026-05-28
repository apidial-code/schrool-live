import { mysqlTable, serial, varchar, timestamp, decimal, integer, text, boolean } from "drizzle-orm/mysql-core";
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  role: varchar("role", { length: 50 }),
});
export const enrollments = mysqlTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  studentName: varchar("student_name", { length: 255 }),
  parentEmail: varchar("parent_email", { length: 255 }),
  tier: varchar("tier", { length: 50 }),
  status: varchar("status", { length: 50 }),
  paymentStatus: varchar("payment_status", { length: 50 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  verificationToken: varchar("verification_token", { length: 255 }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
});
export const courses = mysqlTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
});
export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id"),
  title: varchar("title", { length: 255 }),
  orderIndex: integer("order_index"),
});
export const exercises = mysqlTable("exercises", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id"),
});
export const userProgress = mysqlTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  lessonId: integer("lesson_id"),
});
export const emailCampaigns = mysqlTable("email_campaigns", { id: serial("id").primaryKey() });
export const emailSequences = mysqlTable("email_sequences", { id: serial("id").primaryKey() });
export const emailQueue = mysqlTable("email_queue", { id: serial("id").primaryKey() });
export const emailLogs = mysqlTable("email_logs", { id: serial("id").primaryKey() });
export const diagnosticTestResults = mysqlTable("diagnostic_test_results", { id: serial("id").primaryKey() });
export const zoomSessions = mysqlTable("zoom_sessions", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id"),
  studentId: integer("student_id"),
  teacherId: integer("teacher_id"),
  sessionNumber: integer("session_number"),
  scheduledAt: timestamp("scheduled_at"),
  duration: integer("duration"),
  status: varchar("status", { length: 50 }),
});
export type InsertUser = typeof users.$inferInsert;
