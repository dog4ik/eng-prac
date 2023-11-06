import { unstable_cache as cache } from "next/cache";
import prisma from "../../../../prisma/PrismaClient";

async function fetchSeasons(showId: string) {
  const seasons = await prisma.shows.findFirst({
    where: { id: showId },
    include: {
      season: {
        select: {
          number: true,
          blur_data: true,
          poster: true,
          id: true,
          _count: { select: { episodes: {} } },
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (seasons === null) return undefined;
  return {
    title: seasons.title,
    releaseDate: seasons.release_date,
    poster: seasons.poster,
    backdrop: seasons.backdrop,
    rating: seasons.rating,
    plot: seasons.plot,
    blurData: seasons.blur_data,
    seasons: seasons.season.map((s) => {
      return {
        number: s.number,
        poster: s.poster,
        blurData: s.blur_data,
        id: s.id,
        episodesCount: s._count.episodes,
      };
    }),
  };
}

async function fetchShows() {
  const shows = await prisma.shows.findMany({
    include: { _count: { select: { season: {} } } },
  });
  return shows.map((show) => {
    return { ...show, _count: undefined, seasonsCount: show._count.season };
  });
}

async function fetchEpisodes(showId: string, season: number) {
  const episodes = await prisma.season.findFirst({
    where: {
      shows_id: showId,
      number: season,
    },
    select: {
      poster: true,
      blur_data: true,
      number: true,
      plot: true,
      release_date: true,
      episodes: {
        select: {
          poster: true,
          blur_data: true,
          id: true,
          number: true,
          release_date: true,
          external_subs: true,
          duration: true,
          title: true,
          rating: true,
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (episodes === null) return undefined;

  return {
    poster: episodes.poster,
    blurData: episodes.blur_data,
    number: episodes.number,
    plot: episodes.plot,
    releaseDate: episodes.release_date,
    episodesCount: episodes.episodes.length,
    episodes: episodes.episodes,
  };
}

async function fetchEpisode(
  showId: string,
  seasonNumber: number,
  episodeNumber: number,
) {
  let mediaServerUrl = process.env.MEDIA_SERVER_LINK;
  if (!mediaServerUrl) throw Error("Env of media server is undefined");
  const episode = await prisma.episode.findFirst({
    where: {
      season: { shows_id: showId, number: seasonNumber },
      number: episodeNumber,
    },
    select: {
      release_date: true,
      plot: true,
      number: true,
      title: true,
      src: true,
      external_subs: true,
      rating: true,
      duration: true,
      previews_amount: true,
      id: true,
      tmdb_id: true,
      season: {
        select: {
          number: true,
          shows_id: true,
        },
      },
    },
  });
  if (episode === null) return null;
  return {
    releaseDate: episode.release_date,
    plot: episode.plot,
    number: episode.number,
    title: episode.title,
    src: mediaServerUrl + "/show" + episode.src.replaceAll(" ", "-"),
    subSrc: mediaServerUrl + "/subs" + episode.src,
    previewsSrc: mediaServerUrl + "/show/previews" + episode.src + "?number=",
    rating: episode.rating,
    id: episode.id,
    duration: episode.duration,
    previewsAmount: episode.previews_amount,
    tmdbId: episode.tmdb_id,
    seasonNumber: episode.season?.number,
    showId: episode.season?.shows_id,
  };
}

const revalidateTime = 20_000;

const getShows = cache(fetchShows, ["shows"], { revalidate: revalidateTime });

const getSeasons = async (showId: string) =>
  cache(async () => await fetchSeasons(showId), ["seasons", showId], {
    revalidate: revalidateTime,
  })();

const getEpisodes = async (showsId: string, season: number) =>
  cache(
    async () => await fetchEpisodes(showsId, season),
    ["episodes", showsId, season.toString()],
    {
      revalidate: revalidateTime,
    },
  )();

const getEpisode = async (
  showId: string,
  seasonNumber: number,
  episodeNumber: number,
) =>
  cache(
    async () => await fetchEpisode(showId, seasonNumber, episodeNumber),
    ["episode", showId, seasonNumber.toString(), episodeNumber.toString()],
    { revalidate: revalidateTime },
  )();

export { getSeasons, getShows, getEpisodes, getEpisode };
