import { authRouter } from "./auth/router.ts";
import { publicProcedure, router } from "./trpc.ts";

export const appRouter = router({
  greeting: publicProcedure.query(() => "hello tRPC v11!"),
  auth: authRouter,
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
