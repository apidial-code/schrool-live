import { publicProcedure, router } from "../_core/trpc.js";

export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie("__Host-schrool_session", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }),
});
