import { z } from "zod";
import { router, protectedProcedure, procedure } from "../trpc";
import prisma from "../../../prisma/PrismaClient";
import { TRPCError } from "@trpc/server";
export const theaterRouter = router({
  getShows: procedure.query(async () => {
    const shows = await prisma.shows
      .findMany({
        include: { _count: { select: { Season: {} } } },
      })
      .catch(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      });

    if (shows === null) throw new TRPCError({ code: "NOT_FOUND" });
    return shows.map((show) => {
      return { ...show, _count: undefined, seasonsCount: show._count.Season };
    });
  }),
  getSeasons: procedure
    .input(z.object({ showId: z.string() }))
    .query(async ({ input }) => {
      const seasons = await prisma.shows
        .findFirst({
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
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
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
    .input(z.object({ showId: z.string(), number: z.number() }))
    .query(async ({ input }) => {
      const episodes = await prisma.season
        .findFirst({
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
                title: true,
                rating: true,
              },
              orderBy: { number: "asc" },
            },
          },
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });

      if (episodes === null) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        poster: episodes.poster,
        blurData: episodes.blurData,
        number: episodes.number,
        plot: episodes.plot,
        releaseDate: episodes.releaseDate,
        episodesCount: episodes.Episodes.length,
        episodes: episodes.Episodes,
      };
    }),
  getEpisode: protectedProcedure
    .input(
      z.object({
        showId: z.string(),
        episodeNumber: z.number(),
        seasonNumber: z.number(),
      })
    )
    .query(async ({ input }) => {
      const episode = await prisma.episode
        .findFirst({
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
            id: true,
            tmdbId: true,
            Season: {
              select: {
                number: true,
                showsId: true,
                Episodes: {
                  select: {
                    subSrc: true,
                    title: true,
                    poster: true,
                    blurData: true,
                    number: true,
                    id: true,
                  },
                },
              },
            },
          },
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });
      if (episode === null) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        releaseDate: episode.releaseDate,
        plot: episode.plot,
        number: episode.number,
        title: episode.title,
        src: episode.src,
        subSrc: episode.subSrc,
        rating: episode.rating,
        id: episode.id,
        tmdbId: episode.tmdbId,
        seasonNumber: episode.Season?.number,
        showId: episode.Season?.showsId,
        siblings: episode.Season?.Episodes,
      };
    }),
});
