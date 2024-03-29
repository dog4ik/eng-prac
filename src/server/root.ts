import subsRouter from "./routers/opensrt";
import { testRouter } from "./routers/test";
import { translateRouter } from "./routers/translate";
import { theaterRouter } from "./routers/theater";
import { router } from "./trpc";
import { usersRouter } from "./routers/users";
import { wordleRouter } from "./routers/wordle";
import { historyRouter } from "./routers/history";
import { wordsRouter } from "./routers/words";

export const appRouter = router({
  test: testRouter,
  subs: subsRouter,
  translate: translateRouter,
  theater: theaterRouter,
  user: usersRouter,
  wordle: wordleRouter,
  history: historyRouter,
  words: wordsRouter,
});

export type AppRouter = typeof appRouter;
