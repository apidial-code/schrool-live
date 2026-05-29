import { router } from "../_core/trpc.js";
import { enrollmentNewRouter } from "./enrollmentNew.js";
import { lessonsRouter } from "./lessons.js";
import { studentRouter } from "./student.js";
import { parentRouter } from "./parent.js";
import { teacherRouter } from "./teacher.js";
import { adminRouter } from "./admin.js";
import { teacherOnboardingRouter } from "./teacherOnboarding.js";
import { enrollmentRouter } from "./enrollment.js";
import { progressRouter } from "./progress.js";
import { authRouter } from "./auth.js";
// Placeholder routers to satisfy frontend type requirements
const placeholderRouter = router({});
export const appRouter = router({
    enrollmentNew: enrollmentNewRouter,
    enrollment: enrollmentRouter,
    progress: progressRouter,
    auth: authRouter,
    student: studentRouter,
    parent: parentRouter,
    teacher: teacherRouter,
    admin: adminRouter,
    teacherOnboarding: teacherOnboardingRouter,
    lessons: lessonsRouter,
});
