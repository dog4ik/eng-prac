import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "../../../prisma/PrismaClient";
import { router, protectedProcedure } from "../trpc";

export const wordleRouter = router({
  getGames: protectedProcedure.query(async ({ ctx }) => {
    const games = await prisma.wordle
      .findMany({
        where: { userId: ctx.userId },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      });
    return games;
  }),

  createGame: protectedProcedure
    .input(
      z.object({
        maxTries: z.number().min(1).max(10),
        sourceList: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const words = await prisma.words
        .findMany({
          where: {
            Wordbook: { userId: ctx.userId },
            wordbookId: { in: input.sourceList },
          },
        })
        .then((data) =>
          data
            .map((word) => word.eng)
            .filter((item) => item.length > 3 && item.length < 6)
        );
      if (words.length == 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      const newGame = await prisma.wordle
        .create({
          data: {
            userId: ctx.userId,
            maxTries: input.maxTries,
            word: words[Math.floor(Math.random() * words.length)]
              .trim()
              .toLowerCase(),
          },
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });
      return newGame;
    }),

  getGame: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return await prisma.wordle
        .findFirstOrThrow({
          where: { userId: ctx.userId, id: input.id },
        })
        .catch(() => {
          throw new TRPCError({ code: "NOT_FOUND" });
        });
    }),

  submitAnswer: protectedProcedure
    .input(z.object({ id: z.string(), word: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const wordle = await prisma.wordle.findFirst({
        where: { userId: ctx.userId, id: input.id },
      });
      if (
        wordle?.word === input.word ||
        wordle?.maxTries === wordle!.tries.length + 1
      ) {
        await prisma.wordle
          .updateMany({
            where: { userId: ctx.userId, id: input.id },
            data: {
              tries: { push: input.word },
              finishDate: new Date(),
            },
          })
          .catch(() => {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          });
      } else {
        await prisma.wordle
          .updateMany({
            where: { userId: ctx.userId, id: input.id },
            data: {
              tries: { push: input.word },
            },
          })
          .catch(() => {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          });
      }
    }),
});
