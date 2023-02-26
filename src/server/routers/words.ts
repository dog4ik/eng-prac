import { TRPCError } from "@trpc/server";
import { z } from "zod";
import prisma from "../../../prisma/PrismaClient";
import { router, protectedProcedure, procedure } from "../trpc";
import { translateRouter } from "./translate";

export const wordsRouter = router({
  getLikes: protectedProcedure.query(async ({ ctx }) => {
    const likes = await prisma.words.findMany({
      where: { likedById: ctx.userId },
      select: {
        eng: true,
        rus: true,
        createdAt: true,
        id: true,
      },
    });
    return likes;
  }),

  like: protectedProcedure
    .input(
      z
        .array(
          z.object({
            eng: z.string().max(50),
            rus: z.string().max(50).optional(),
          })
        )
        .max(12_000)
    )
    .mutation(async ({ ctx, input }) => {
      const translateCaller = translateRouter.createCaller(ctx);
      const translatedInput: {
        rus: string;
        eng: string;
      }[] = [];
      let failedCount = 0;
      for (let i = 0; i < input.length; i++) {
        const item = input[i];
        let translatedWord = item.rus;
        if (!item.rus) {
          translatedWord = await translateCaller
            .translate({ text: item.eng })
            .then((data) => data.translations[0].text)
            .catch(() => {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Translations are unavailble right now",
              });
            });
        }
        if (!translatedWord) {
          failedCount++;
          continue;
        }
        translatedInput.push({ eng: item.eng, rus: translatedWord });
      }

      // TODO: Skip dublicates
      await prisma.words.createMany({
        data: translatedInput.map((item) => ({
          eng: item.eng,
          rus: item.rus,
          likedById: ctx.userId,
        })),
      });
      return failedCount;
    }),

  unLike: protectedProcedure
    .input(
      z
        .array(
          z.object({
            eng: z.string().max(50),
          })
        )
        .max(12_000)
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.words.deleteMany({
        where: {
          likedById: ctx.userId,
          eng: { in: input.map((item) => item.eng) },
        },
      });
    }),

  getAllWordbooks: protectedProcedure.query(async ({ ctx }) => {
    const likes = prisma.words.findMany({
      where: { likedById: ctx.userId },
      select: { rus: true, eng: true, id: true, createdAt: true },
    });
    const wordbooks = prisma.wordbook.findMany({
      where: { userId: ctx.userId },
      select: {
        id: true,
        private: true,
        name: true,
        likes: true,
        words: true,
        createdAt: true,
        description: true,
        _count: { select: { words: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return await Promise.all([likes, wordbooks]).then(([likes, wordbooks]) => {
      let wordsWithLikes = wordbooks.map((wordbook) => {
        return {
          ...wordbook,
          likesCount: wordbook.words.reduce((sum, item) => {
            if (likes.map((item) => item.eng).includes(item.eng))
              return sum + 1;
            else return sum;
          }, 0),
        };
      });
      return wordsWithLikes.map(({ words, ...rest }) => rest);
    });
  }),

  getWordbook: procedure
    .input(z.object({ id: z.string().max(50) }))
    .query(async ({ ctx, input }) => {
      if (ctx.userId) {
        const wordbook = await prisma.wordbook.findFirst({
          where: { id: input.id, userId: ctx.userId },
          select: {
            id: true,
            private: true,
            words: {
              select: {
                createdAt: true,
                id: true,
                rus: true,
                eng: true,
                likedById: true,
              },
            },
            name: true,
            likes: true,
            createdAt: true,
            description: true,
            userId: true,
          },
        });
        if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
        const isOwned = wordbook.userId == ctx.userId;
        return { ...wordbook, isOwned };
      } else {
        const wordbook = await prisma.wordbook.findFirst({
          where: { private: false, id: input.id },
          select: {
            id: true,
            private: true,
            words: {
              select: { createdAt: true, id: true, rus: true, eng: true },
            },
            name: true,
            likes: true,
            createdAt: true,
            description: true,
          },
        });
        if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
        return { ...wordbook, isOwned: false };
      }
    }),

  removeWord: protectedProcedure
    .input(
      z.object({
        wordbookId: z.string().max(50),
        wordsIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await prisma.words.deleteMany({
        where: {
          Wordbook: { userId: ctx.userId, id: input.wordbookId },
          id: { in: input.wordsIds },
        },
      });
    }),

  addWord: protectedProcedure
    .input(
      z.object({
        wordbookId: z.string().max(50),
        words: z
          .array(
            z.object({
              eng: z.string().max(50),
              rus: z.string().max(50).optional(),
            })
          )
          .max(12_000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const translateCaller = translateRouter.createCaller(ctx);
      const wordbook = await prisma.wordbook.findFirst({
        where: { userId: ctx.userId, id: input.wordbookId },
      });
      if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
      let data: { rus: string; eng: string; wordbookId: string }[] = [];
      for (let i = 0; i < input.words.length; i++) {
        const item = input.words[i];
        let translatedWord = item.rus;
        if (!item.rus)
          translatedWord = await translateCaller
            .translate({ text: item.eng })
            .then((data) => data.translations[0].text)
            .catch(() => {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Translations are unavailble right now",
              });
            });
        if (translatedWord)
          data.push({
            rus: translatedWord,
            eng: item.eng,
            wordbookId: input.wordbookId,
          });
      }
      await prisma.words.createMany({ data: data, skipDuplicates: true });
    }),

  //TODO: Rewrite all this crap
  exportWords: protectedProcedure
    .input(
      z.object({
        id: z.string().max(50),
        file: z.string().max(100000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      let array = input.file.replaceAll(/\r/g, "").split(/\n+/g);

      let failed = 0;

      let words: { eng: string; rus: string }[] = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i].split(",").length !== 4) {
          failed++;
          continue;
        }
        const [firstLang, secondLang, first, second] = array[i].split(",");
        if (firstLang === "English" && secondLang === "Russian") {
          if (first.search(/[a-z]/i) == -1) continue;
          if (second.search(/[а-я]/i) == -1) continue;
          words.push({ eng: first, rus: second });
        }
        if (firstLang === "Russian" && secondLang === "English") {
          if (first.search(/[а-я]/i) == -1) continue;
          if (second.search(/[a-z]/i) == -1) continue;
          words.push({ eng: second, rus: first });
        }
      }
      const wordbook = await prisma.wordbook.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
      await prisma.wordbook.update({
        where: { id: wordbook.id },
        data: { words: { createMany: { data: words } } },
      });
      return { failed };
    }),

  editWordbook: protectedProcedure
    .input(
      z.object({
        id: z.string().max(50),
        name: z.string().max(50),
        isPrivate: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const wordbook = await prisma.wordbook.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
      await prisma.wordbook.update({
        where: { id: wordbook.id },
        data: { name: input.name, private: input.isPrivate },
      });
    }),

  deleteWordbook: protectedProcedure
    .input(z.object({ id: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      const wordbook = await prisma.wordbook.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });
      if (!wordbook) throw new TRPCError({ code: "NOT_FOUND" });
      await prisma.wordbook.delete({ where: { id: wordbook.id } });
    }),

  createWordbook: protectedProcedure
    .input(z.object({ name: z.string().max(50) }))
    .mutation(async ({ ctx, input }) => {
      await prisma.wordbook.create({
        data: { name: input.name, userId: ctx.userId },
      });
    }),
});
