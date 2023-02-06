import { z } from "zod";
import prisma from "../../../prisma/PrismaClient";
import { router, procedure, protectedProcedure } from "../trpc";

export const historyRouter = router({
  updateHistory: protectedProcedure
    .input(
      z.object({
        episodeId: z.string(),
        time: z.number(),
        isFinished: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const history = await prisma.watchHisory.findFirst({
        where: { userId: ctx.userId, episodeId: input.episodeId },
      });
      if (!history) {
        await prisma.watchHisory.create({
          data: {
            userId: ctx.userId,
            episodeId: input.episodeId,
            time: input.time,
            isFinished: input.isFinished,
          },
        });
      } else {
        await prisma.watchHisory.update({
          where: { id: history.id },
          data: { time: input.time, isFinished: input.isFinished },
        });
      }
    }),
  testOpen: procedure
    .input(z.object({ text: z.string() }))
    .mutation(({ input, ctx }) => {
      return { testText: `hi from open ${ctx.user}` };
    }),
});
