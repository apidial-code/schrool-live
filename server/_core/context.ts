import { type CreateExpressContextOptions } from "@trpc/server/adapters/express";
export const createContext = async ({ req, res }: CreateExpressContextOptions) => {
  return {
    req,
    res,
    user: null, // Simplified for demo
  };
};
export type Context = Awaited<ReturnType<typeof createContext>>;
