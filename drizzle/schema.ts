import {
  mysqlTable, serial, varchar, timestamp, decimal,
  int, text, boolean, uniqueIndex
} from "drizzle-orm/mysql-core";
// Application roles: student, parent, teacher, consultant, admin.
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).unique(),
  role: varchar("role", { length: 50 })
    .notNull().default("student"),
  accountStatus: varchar("account_status", { length: 30 })
    .notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow().onUpdateNow().notNull(),
});

export const parentStudentLinks = mysqlTable(
  "parent_student_links",
  {
    id: serial("id").primaryKey(),
    parentId: int("parent_id").notNull(),
    studentId: int("student_id").notNull(),
    status: varchar("status", { length: 30 })
      .notNull().default("pending"),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("parent_student_pair")
      .on(table.parentId, table.studentId),
  ]
);

export const enrollments = mysqlTable("enrollments", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  parentId: int("parent_id"),
  studentId: int("student_id"),
  consultantId: int("consultant_id"),
  courseId: int("course_id"),
  yearLevel: varchar("year_level", { length: 30 }),
  studentName: varchar("student_name", { length: 255 }),
  parentEmail: varchar("parent_email", { length: 255 }),
  tier: varchar("tier", { length: 50 }),
  status: varchar("status", { length: 50 })
    .notNull().default("draft"),
  paymentStatus: varchar("payment_status", { length: 50 })
    .notNull().default("unpaid"),
  currency: varchar("currency", { length: 3 })
    .notNull().default("AUD"),
  paymentPlan: varchar("payment_plan", { length: 50 }),
  agreedTotalCents: int("agreed_total_cents", {
    unsigned: true,
  }),
  termsVersion: varchar("terms_version", { length: 100 }),
  agreementSnapshot: text("agreement_snapshot"),
  acceptedAt: timestamp("accepted_at"),
  acceptanceLinkExpiresAt: timestamp("acceptance_link_expires_at"),
  activatedAt: timestamp("activated_at"),
  accessEndsAt: timestamp("access_ends_at"),
  adjustedCourseFinishAt: timestamp("adjusted_course_finish_at"),
  stripeSubscriptionId: varchar("stripe_subscription_id", {
    length: 255,
  }),
  verificationToken: varchar("verification_token", {
    length: 255,
  }),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow().onUpdateNow().notNull(),
});
export const courses = mysqlTable("courses", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
});
export const lessons = mysqlTable("lessons", {
  id: serial("id").primaryKey(),
  courseId: int("course_id"),
  title: varchar("title", { length: 255 }),
  orderIndex: int("order_index"),
});
export const exercises = mysqlTable("exercises", {
  id: serial("id").primaryKey(),
  lessonId: int("lesson_id"),
});
export const userProgress = mysqlTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: int("user_id"),
  lessonId: int("lesson_id"),
});
export const emailCampaigns = mysqlTable("email_campaigns", { id: serial("id").primaryKey() });
export const emailSequences = mysqlTable("email_sequences", { id: serial("id").primaryKey() });
export const emailQueue = mysqlTable("email_queue", { id: serial("id").primaryKey() });
export const emailLogs = mysqlTable("email_logs", { id: serial("id").primaryKey() });
export const diagnosticTestResults = mysqlTable("diagnostic_test_results", { id: serial("id").primaryKey() });
export const zoomSessions = mysqlTable("zoom_sessions", {
  id: serial("id").primaryKey(),
  enrollmentId: int("enrollment_id"),
  studentId: int("student_id"),
  teacherId: int("teacher_id"),
  sessionNumber: int("session_number"),
  scheduledAt: timestamp("scheduled_at"),
  duration: int("duration"),
  status: varchar("status", { length: 50 }),
});
export type InsertUser = typeof users.$inferInsert;
export const loginLinks = mysqlTable("login_links", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 64 })
    .notNull().unique(),
  rememberDevice: boolean("remember_device")
    .notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
});

export const loginSessions = mysqlTable("login_sessions", {
  id: serial("id").primaryKey(),
  userId: int("user_id").notNull(),
  tokenHash: varchar("token_hash", { length: 64 })
    .notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
});
