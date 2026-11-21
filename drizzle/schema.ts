import {
  mysqlTable, serial, varchar, timestamp, decimal,
  int, text, longtext, boolean, uniqueIndex, index
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
  bunnyLibraryId: int("bunny_library_id"),
  bunnyVideoId: varchar("bunny_video_id", { length: 36 }),
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
export const lessonQuestions = mysqlTable(
  "lesson_questions",
  {
    id: serial("id").primaryKey(),
    lessonId: int("lesson_id").notNull(),
    sourceId: varchar("source_id", { length: 40 }).notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(),
    orderIndex: int("order_index").notNull(),
    questionText: text("question_text").notNull(),
    diagram: longtext("diagram"),
    optionsJson: text("options_json").notNull(),
    correctAnswer: text("correct_answer").notNull(),
    solutionVideoId: varchar("solution_video_id", { length: 36 }),
  },
  (table) => [
    uniqueIndex("lesson_question_source")
      .on(table.lessonId, table.sourceId),
    uniqueIndex("lesson_question_position")
      .on(table.lessonId, table.difficulty, table.orderIndex),
  ],
);
export const lessonAttempts = mysqlTable(
  "lesson_attempts",
  {
    id: serial("id").primaryKey(),
    attemptToken: varchar("attempt_token", { length: 36 })
      .notNull().unique(),
    activeKey: varchar("active_key", { length: 100 }).unique(),
    studentId: int("student_id").notNull(),
    enrollmentId: int("enrollment_id").notNull(),
    lessonId: int("lesson_id").notNull(),
    difficulty: varchar("difficulty", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 })
      .notNull().default("in_progress"),
    questionSnapshot: longtext("question_snapshot").notNull(),
    answersJson: text("answers_json").notNull(),
    solutionViewedJson: text("solution_viewed_json").notNull(),
    rawScore: int("raw_score"),
    validScore: int("valid_score"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow().onUpdateNow().notNull(),
    submittedAt: timestamp("submitted_at"),
  },
  (table) => [
    index("lesson_attempt_history").on(
      table.studentId,
      table.enrollmentId,
      table.lessonId,
      table.difficulty,
    ),
  ],
);
export const enrollmentPayments = mysqlTable(
  "enrollment_payments",
  {
    id: serial("id").primaryKey(),
    enrollmentId: int("enrollment_id").notNull(),
    attemptKey: varchar("attempt_key", { length: 36 })
      .notNull().unique(),
    activeKey: varchar("active_key", { length: 100 })
      .unique(),
    stripeCheckoutSessionId: varchar(
      "stripe_checkout_session_id",
      { length: 255 },
    ).unique(),
    stripePaymentIntentId: varchar(
      "stripe_payment_intent_id",
      { length: 255 },
    ).unique(),
    reviewDigest: varchar("review_digest", { length: 64 })
      .notNull(),
    amountCents: int("amount_cents", { unsigned: true })
      .notNull(),
    currency: varchar("currency", { length: 3 })
      .notNull().default("AUD"),
    status: varchar("status", { length: 30 })
      .notNull().default("creating"),
    livemode: boolean("livemode").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow().onUpdateNow().notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => [
    index("enrollment_payment_history").on(table.enrollmentId),
  ],
);

// Append-only Admin notes and Standard support calls, scoped to an enrolment.
export const studentFileEntries = mysqlTable("student_file_entries", {
  id: serial("id").primaryKey(),
  enrollmentId: int("enrollment_id").notNull(),
  authorId: int("author_id").notNull(),
  requestId: varchar("request_id", { length: 36 }).notNull().unique(),
  kind: varchar("kind", { length: 20 }).notNull(),
  entryDate: varchar("entry_date", { length: 10 }).notNull(),
  minutes: int("minutes").notNull().default(0),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, table => [index("student_file_entry_history").on(table.enrollmentId, table.id)]);


// Dedicated scheduling tables keep the legacy demonstration zoom_sessions separate.
export const eliteScheduleLock = mysqlTable("elite_schedule_lock", {
  id: int("id").primaryKey(),
});
export const eliteTutors = mysqlTable("elite_tutors", {
  teacherId: int("teacher_id").primaryKey(),
  approved: boolean("approved").notNull().default(false),
  approvedBy: int("approved_by").notNull(),
  timezone: varchar("timezone", { length: 100 }).notNull().default("Australia/Sydney"),
  windowsJson: text("windows_json").notNull(),
  commitmentAt: timestamp("commitment_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});
export const eliteFamilyInvites = mysqlTable("elite_family_invites", {
  issuedBy: int("issued_by").notNull(),
  enrollmentId: int("enrollment_id").primaryKey(),
  tokenHash: varchar("token_hash", { length:64 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
});
export const eliteAllocations = mysqlTable("elite_allocations", {
  enrollmentId: int("enrollment_id").primaryKey(),
  teacherId: int("teacher_id").notNull(),
  timezone: varchar("timezone", { length:100 }).notNull(),
  weekStart: varchar("week_start", { length:10 }).notNull(),
  slotsJson: text("slots_json").notNull(),
  parentConfirmedAt: timestamp("parent_confirmed_at").notNull(),
  tutorCommitmentAt: timestamp("tutor_commitment_at").notNull(),
  parentName: varchar("parent_name", { length:255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const eliteTeachingSessions = mysqlTable("elite_teaching_sessions", {
  id: serial("id").primaryKey(),
  enrollmentId: int("enrollment_id").notNull(),
  teacherId: int("teacher_id").notNull(),
  studentId: int("student_id").notNull(),
  sequence: int("sequence").notNull(),
  lessonId: int("lesson_id").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: varchar("status", { length:30 }).notNull().default("scheduled"),
}, t => [uniqueIndex("elite_session_sequence").on(t.enrollmentId,t.sequence), index("elite_teacher_calendar").on(t.teacherId,t.startsAt)]);
export const eliteSessionReports = mysqlTable("elite_session_reports", {
  id: serial("id").primaryKey(),
  sessionId: int("session_id").notNull(),
  authorId: int("author_id").notNull(),
  requestId: varchar("request_id", { length:36 }).notNull().unique(),
  revisionOf: int("revision_of"),
  lessonUnderstanding: text("lesson_understanding").notNull(),
  nextObjectives: text("next_objectives").notNull(),
  progressDifficulties: text("progress_difficulties").notNull(),
  assignedWork: text("assigned_work").notNull(),
  tutorComments: text("tutor_comments").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [index("elite_session_report_history").on(t.sessionId,t.id)]);

export const eliteReplacements = mysqlTable("elite_replacements", {
  id: serial("id").primaryKey(),
  originalId: int("original_id").notNull().unique(),
  enrollmentId: int("enrollment_id").notNull(),
  teacherId: int("teacher_id").notNull(),
  reason: varchar("reason", { length:30 }).notNull(),
  note: text("note").notNull(),
  waitingConfirmed: boolean("waiting_confirmed").notNull(),
  status: varchar("status", { length:30 }).notNull().default("awaiting_plan"),
  planJson: text("plan_json"),
  tokenHash: varchar("token_hash", { length:64 }),
  expiresAt: timestamp("expires_at"),
  parentName: varchar("parent_name", { length:255 }),
  approvedAt: timestamp("approved_at"),
  replacementId: int("replacement_id"),
  feeCents: int("fee_cents").notNull().default(8000),
  funding: varchar("funding", { length:30 }).notNull().default("parent"),
  reviewedBy: int("reviewed_by"),
  billingStatus: varchar("billing_status", { length:30 }).notNull().default("not_due"),
  billingReference: varchar("billing_reference", { length:255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [index("elite_replacement_enrollment").on(t.enrollmentId)]);

// Each exceptional assignment is retained, including cancelled cover decisions.
export const eliteSessionCovers = mysqlTable("elite_session_covers", {
  id: serial("id").primaryKey(),
  sessionId: int("session_id").notNull(),
  enrollmentId: int("enrollment_id").notNull(),
  regularTeacherId: int("regular_teacher_id").notNull(),
  coverTeacherId: int("cover_teacher_id").notNull(),
  approvedBy: int("approved_by").notNull(),
  reason: text("reason").notNull(),
  handover: text("handover").notNull(),
  familyNotice: text("family_notice").notNull(),
  status: varchar("status", { length:30 }).notNull().default("assigned"),
  reviewKey: varchar("review_key", { length:64 }),
  acknowledgedAt: timestamp("acknowledged_at"),
  returnNote: text("return_note"),
  returnedReportId: int("returned_report_id"),
  returnedAt: timestamp("returned_at"),
  cancelledBy: int("cancelled_by"),
  cancellationReason: text("cancellation_reason"),
  lateReviewApprovedBy: int("late_review_approved_by"),
  lateReviewReason: text("late_review_reason"),
  lateReviewApprovedAt: timestamp("late_review_approved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, t => [index("elite_cover_session").on(t.sessionId,t.id),index("elite_cover_regular_tutor").on(t.regularTeacherId,t.id)]);
