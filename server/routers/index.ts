import { router } from "../_core/trpc";
import { enrollmentNewRouter } from "./enrollmentNew";
import { enrollmentRouter } from "./enrollment";
export const appRouter = router({
  enrollmentNew: enrollmentNewRouter,
  enrollment: enrollmentRouter,
});
export type AppRouter = typeof appRouter;
