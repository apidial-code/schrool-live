import { router, publicProcedure } from "../_core/trpc.js";
import { z } from "zod";
export const teacherOnboardingRouter = router({
    validateApprovalCode: publicProcedure
        .input(z.object({ code: z.string() }))
        .query(async ({ input }) => {
        console.log("Validating approval code:", input.code);
        return { valid: input.code === "MANUS" };
    }),
    getExamAttempts: publicProcedure
        .input(z.object({ teacherId: z.number() }))
        .query(async ({ input }) => {
        console.log("Getting exam attempts for teacher:", input.teacherId);
        return { attempts: 0 };
    }),
    // Add other teacher onboarding-related procedures as needed
});
