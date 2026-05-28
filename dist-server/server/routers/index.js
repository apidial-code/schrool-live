import { router } from "../_core/trpc.js";
import { enrollmentNewRouter } from "./enrollmentNew.js";
export const appRouter = router({
    enrollmentNew: enrollmentNewRouter,
});
