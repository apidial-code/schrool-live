import { router } from "../_core/trpc.js";
import { lessonsRouter } from "./lessons.js";
import { enrollmentNewRouter } from "./enrollmentNew.js";
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
    // Adding placeholders for other routers used in the frontend
    student: placeholderRouter,
    parent: placeholderRouter,
    teacher: placeholderRouter,
    admin: placeholderRouter,
    teacherOnboarding: placeholderRouter,
    lessons: lessonsRouter,
});
