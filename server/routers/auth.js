import { publicProcedure, router } from "../_core/trpc.js";
export const authRouter = router({
    me: publicProcedure.query(async () => {
        return {
            id: 1,
            name: "Demo Student",
            email: "student@example.com",
            role: "student",
        };
    }),
    logout: publicProcedure.mutation(async () => {
        return { success: true };
    }),
});
