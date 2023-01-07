import subsRouter from "./routers/opensrt";
import { testRouter } from "./routers/test";
import { translateRouter } from "./routers/translate";
import { router } from "./trpc";

export const appRouter = router({
  test: testRouter,
  subs: subsRouter,
  translate: translateRouter,
});

export type AppRouter = typeof appRouter;
