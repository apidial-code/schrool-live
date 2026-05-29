import { createTRPCReact } from "@trpc/react-query";
import { QueryClient } from "@tanstack/react-query";
export const trpc = createTRPCReact();
export const queryClient = new QueryClient();
