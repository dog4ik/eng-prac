import { z } from "zod";
import { router, protectedProcedure, procedure } from "../trpc";
import prisma from "../../../prisma/PrismaClient";
import { TRPCError } from "@trpc/server";
import { Season } from "@prisma/client";
export const theaterRouter = router({
  getShows: procedure.query(async () => {
    const shows = await prisma.shows.findMany({
      include: { _count: { select: { Season: {} } } },
    });

    if (shows === null) throw new TRPCError({ code: "NOT_FOUND" });
    return shows.map((show) => {
      return { ...show, _count: undefined, seasonsCount: show._count.Season };
    });
  }),
  getSeasons: procedure
    .input(z.object({ showId: z.string().max(50) }))
    .query(async ({ input }) => {
      const seasons = await prisma.shows.findFirst({
        where: { id: input.showId },
        include: {
          Season: {
            select: {
              number: true,
              blurData: true,
              poster: true,
              id: true,
              _count: { select: { Episodes: {} } },
            },
            orderBy: { number: "asc" },
          },
        },
      });

      if (seasons === null) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        title: seasons.title,
        releaseDate: seasons.releaseDate,
        poster: seasons.poster,
        backdrop: seasons.backdrop,
        rating: seasons.rating,
        plot: seasons.plot,
        blurData: seasons.blurData,
        seasons: seasons.Season.map((s) => {
          return {
            number: s.number,
            poster: s.poster,
            blurData: s.blurData,
            id: s.id,
            episodesCount: s._count.Episodes,
          };
        }),
      };
    }),

  getEpisodes: procedure
    .input(z.object({ showId: z.string().max(50), number: z.number() }))
    .query(async ({ input, ctx }) => {
      const episodes = await prisma.season.findFirst({
        where: {
          showsId: input.showId,
          number: input.number,
        },
        select: {
          poster: true,
          blurData: true,
          number: true,
          plot: true,
          releaseDate: true,
          Episodes: {
            select: {
              poster: true,
              blurData: true,
              id: true,
              number: true,
              releaseDate: true,
              subSrc: true,
              duration: true,
              title: true,
              rating: true,
            },
            orderBy: { number: "asc" },
          },
        },
      });

      if (episodes === null) throw new TRPCError({ code: "NOT_FOUND" });
      let history: {
        episodeId: string;
        time: number;
        isFinished: boolean;
      }[] = [];
      if (ctx.userId) {
        const episodesIds = episodes.Episodes.map((ep) => ep.id);
        history = await prisma.watchHisory.findMany({
          where: { userId: ctx.userId, episodeId: { in: episodesIds } },
          select: {
            episodeId: true,
            time: true,
            isFinished: true,
          },
        });
      }

      return {
        poster: episodes.poster,
        blurData: episodes.blurData,
        number: episodes.number,
        plot: episodes.plot,
        releaseDate: episodes.releaseDate,
        episodesCount: episodes.Episodes.length,
        episodes: episodes.Episodes,
        history,
      };
    }),
  getEpisode: protectedProcedure
    .input(
      z.object({
        showId: z.string().max(50),
        episodeNumber: z.number(),
        seasonNumber: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const episode = await prisma.episode.findFirst({
        where: {
          Season: { showsId: input.showId, number: input.seasonNumber },
          number: input.episodeNumber,
        },
        select: {
          releaseDate: true,
          plot: true,
          number: true,
          title: true,
          src: true,
          subSrc: true,
          rating: true,
          duration: true,
          id: true,
          tmdbId: true,
          Season: {
            select: {
              number: true,
              showsId: true,
            },
          },
        },
      });
      if (episode === null) throw new TRPCError({ code: "NOT_FOUND" });
      const history = await prisma.watchHisory.findFirst({
        where: { userId: ctx.userId, episodeId: episode.id },
        select: { isFinished: true, time: true, updatedAt: true },
      });
      return {
        releaseDate: episode.releaseDate,
        plot: episode.plot,
        number: episode.number,
        title: episode.title,
        src: process.env.MEDIA_SERVER_LINK + "/static" + episode.src,
        subSrc: process.env.MEDIA_SERVER_LINK + "/static" + episode.subSrc,
        rating: episode.rating,
        id: episode.id,
        duration: episode.duration,
        tmdbId: episode.tmdbId,
        seasonNumber: episode.Season?.number,
        showId: episode.Season?.showsId,
        history,
      };
    }),
  getEpisodeSiblings: protectedProcedure
    .input(z.object({ showId: z.string().max(50), season: z.number() }))
    .query(async ({ input }) => {
      const siblings = await prisma.episode.findMany({
        where: { Season: { showsId: input.showId, number: input.season } },
        select: {
          number: true,
          title: true,
          id: true,
          poster: true,
          duration: true,
          blurData: true,
        },
        orderBy: { number: "asc" },
      });
      return siblings;
    }),
  getRandomSeasons: procedure.query(async () => {
    const seasons = await prisma.$queryRawUnsafe(
      'SELECT "id","blurData","number","poster","showsId" FROM "Season" ORDER BY RANDOM() LIMIT 10;'
    );
    return seasons as Pick<
      Season,
      "poster" | "number" | "blurData" | "showsId" | "id"
    >[];
  }),
});
