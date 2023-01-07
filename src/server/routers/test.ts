import { z } from "zod";
import { router, procedure, protectedProcedure } from "../trpc";

export const testRouter = router({
  testSecure: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(({ input, ctx }) => {
      return { testText: `hi from secure ${ctx.user}` };
    }),

  testOpen: procedure
    .input(z.object({ text: z.string() }))
    .mutation(({ input, ctx }) => {
      return { testText: `hi from open ${ctx.user}` };
    }),
});
