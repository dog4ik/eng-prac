import subsRouter from "./routers/opensrt";
import { testRouter } from "./routers/test";
import { translateRouter } from "./routers/translate";
import { theaterRouter } from "./routers/theater";
import { router } from "./trpc";
import { usersRouter } from "./routers/users";

export const appRouter = router({
  test: testRouter,
  subs: subsRouter,
  translate: translateRouter,
  theater: theaterRouter,
  user: usersRouter,
});

export type AppRouter = typeof appRouter;
