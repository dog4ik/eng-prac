import subsRouter from "./routers/opensrt";
import { testRouter } from "./routers/test";
import { router } from "./trpc";

export const appRouter = router({
  test: testRouter,
  subs: subsRouter,
});

export type AppRouter = typeof appRouter;
