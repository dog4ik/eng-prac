import { z } from "zod";
import prisma from "../../../prisma/PrismaClient";
import { router, protectedProcedure } from "../trpc";

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

  deleteHistory: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.watchHisory.deleteMany({ where: { userId: ctx.userId } });
  }),

  deleteHistoryItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const count = await prisma.watchHisory.deleteMany({
        where: { id: input.id, userId: ctx.userId },
      });
      return count;
    }),

  markWatched: protectedProcedure
    .input(z.object({ episodeId: z.string(), isWatched: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const item = await prisma.watchHisory.findFirst({
        where: { userId: ctx.userId, episodeId: input.episodeId },
      });
      if (item) {
        if (input.isWatched) {
          await prisma.watchHisory.update({
            where: { id: item.id },
            data: { time: 0, isFinished: input.isWatched },
          });
        } else {
          await prisma.watchHisory.delete({ where: { id: item.id } });
        }
        return;
      }
      if (input.isWatched)
        await prisma.watchHisory.create({
          data: {
            isFinished: true,
            episodeId: input.episodeId,
            time: 0,
            userId: ctx.userId,
          },
        });
    }),

  getPaginatedHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).optional(),
        cursor: z.string().max(100).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const limit = input.limit ?? 20;
      const history = await prisma.watchHisory.findMany({
        take: limit + 1,
        where: { userId: ctx.userId },
        orderBy: { updatedAt: "desc" },
        cursor: input.cursor ? { id: input.cursor } : undefined,
        select: {
          time: true,
          isFinished: true,
          updatedAt: true,
          id: true,
          Episode: {
            select: {
              title: true,
              duration: true,
              poster: true,
              blurData: true,
              number: true,
              plot: true,
              id: true,
              Season: { select: { number: true, showsId: true } },
            },
          },
        },
      });
      let nextCursor: typeof input.cursor = undefined;
      if (history.length > limit) {
        const nextItem = history.pop();
        nextCursor = nextItem!.id;
      }
      return {
        history,
        nextCursor,
      };
    }),
});
