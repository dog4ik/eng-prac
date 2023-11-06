import axios from "axios";
import prisma from "../../../../../prisma/PrismaClient";
import { TmdbSearchShow, TmdbShowSeason } from "./tmdbTypes";
import { NextResponse } from "next/server";

type ResponseEntry = {
  title: string;
  season: number;
  episode: number;
  previews: number;
  duration: string;
  href: string;
  subs: string[];
};
type ReqBody = {
  language?: string;
  password: string;
};

const generateBase64Image = async (path: string) => {
  return await axios
    .get("https://image.tmdb.org/t/p/w45" + path, {
      responseType: "arraybuffer",
    })
    .then((data) => Buffer.from(data.data, "binary").toString("base64"));
};

const IMG_BASE_URL = "https://image.tmdb.org/t/p/original";
export async function POST(req: Request) {
  let body: ReqBody | undefined;
  await req
    .json()
    .then((json) => (body = json))
    .catch(() => (body = undefined));
  const tmdbApi = axios.create({
    baseURL: "http://api.themoviedb.org/3",
    params: {
      api_key: process.env.TMDB_TOKEN,
      language: body?.language ?? "en-US",
    },
    headers: {
      "Accept-Encoding": "compress",
    },
  });
  const serverLibrary = await axios
    .get<ResponseEntry[]>(process.env.MEDIA_SERVER_LINK + "/summary")
    .then((data) => data.data);
  let library: Map<string, Map<number, number[]>> = serverLibrary.reduce(
    (acc, ep) => {
      let { title, episode, season } = ep;
      if (!acc.has(title)) {
        let map: Map<number, number[]> = new Map();
        map.set(season, [episode]);
        acc.set(title, map);
      } else {
        let nestedSeasons = acc.get(title);
        if (!nestedSeasons?.has(season)) {
          nestedSeasons?.set(season, [episode]);
        } else {
          let curr = nestedSeasons.get(season);
          curr?.push(episode);
          nestedSeasons.set(season, curr!);
        }
        acc.set(title, nestedSeasons!);
      }
      return acc;
    },
    new Map(),
  );
  let serverShowsTmdbIds: number[] = [];
  for (const [show, seasons] of library) {
    const tmdbSearchResult = await tmdbApi
      .get<TmdbSearchShow>("/search/tv", {
        params: { query: show },
      })
      .then((data) => data.data)
      .catch(null);
    if (tmdbSearchResult === null) continue;
    let topSearchResult = tmdbSearchResult.results[0];
    serverShowsTmdbIds.push(topSearchResult.id);
    let showPosterBlur = topSearchResult.poster_path
      ? await generateBase64Image(topSearchResult.poster_path).catch(() => null)
      : null;
    //make it here
    let showPosterUrl = IMG_BASE_URL + topSearchResult.poster_path;
    let showBackdropUrl = IMG_BASE_URL + topSearchResult.backdrop_path;
    console.log(showPosterUrl, showBackdropUrl);

    let myShow = await prisma.shows.upsert({
      where: { tmdb_id: topSearchResult.id },
      create: {
        tmdb_id: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: showPosterUrl,
        backdrop: showBackdropUrl,
        rating: topSearchResult.vote_average,
        original_language: topSearchResult.original_language,
        release_date: topSearchResult.first_air_date,
        blur_data: showPosterBlur,
      },
      update: {
        tmdb_id: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: showPosterUrl,
        backdrop: showBackdropUrl,
        rating: topSearchResult.vote_average,
        original_language: topSearchResult.original_language,
        release_date: topSearchResult.first_air_date,
        blur_data: showPosterBlur,
      },
      select: {
        id: true,
      },
    });
    await prisma.season.deleteMany({
      where: {
        shows_id: myShow.id,
        number: { notIn: Array.from(seasons.keys()) },
      },
    });
    //map seasons
    for (const [season, episodes] of seasons) {
      //skip unnessasary api call
      console.log(myShow.id, season);
      const localSeason = await prisma.season.findFirst({
        where: { shows_id: myShow.id, number: season },
        select: { episodes: { select: { number: true } }, id: true },
      });
      if (
        localSeason &&
        episodes.every((ep) =>
          localSeason.episodes.map((ep) => ep.number).includes(ep),
        )
      ) {
        await prisma.episode.deleteMany({
          where: { season_id: localSeason.id, number: { notIn: episodes } },
        });
        console.log(`Skipped ${season} season of ${topSearchResult.name}`);
        continue;
      }

      console.log(`Getting ${season} season of ${topSearchResult.name}`);
      const tmdbSeason = await tmdbApi
        .get<TmdbShowSeason>(
          `/tv/${tmdbSearchResult.results[0].id}/season/${season}`,
        )
        .then((data) => data.data)
        .catch(null);
      if (tmdbSeason === null) continue;
      let seasonPosterBlur = tmdbSeason.poster_path
        ? await generateBase64Image(tmdbSeason.poster_path).catch(null)
        : null;
      //make it also here
      //TODO: handle error
      const seasonPosterUrl = IMG_BASE_URL + tmdbSeason.poster_path;
      let mySeason = await prisma.season.upsert({
        where: { tmdb_id: tmdbSeason.id },
        create: {
          number: tmdbSeason.season_number,
          poster: seasonPosterUrl,
          plot: tmdbSeason.overview,
          tmdb_id: tmdbSeason.id,
          release_date: tmdbSeason.air_date,
          shows_id: myShow.id,
          blur_data: seasonPosterBlur,
        },
        update: {
          number: tmdbSeason.season_number,
          poster: seasonPosterUrl,
          plot: tmdbSeason.overview,
          tmdb_id: tmdbSeason.id,
          release_date: tmdbSeason.air_date,
          shows_id: myShow.id,
          blur_data: seasonPosterBlur,
        },
        select: { id: true },
      });
      if (!tmdbSeason?.episodes) continue;
      //filter all episodes and those who in response
      let tmdbEpisodes = tmdbSeason.episodes.filter((ep) =>
        episodes.includes(ep.episode_number),
      );
      await prisma.episode.deleteMany({
        where: {
          season_id: mySeason.id,
          tmdb_id: { notIn: tmdbEpisodes.map((item) => item.id) },
        },
      });
      //Handle Episodes
      //make it also here
      await prisma.episode.createMany({
        data: await Promise.all(
          tmdbEpisodes.map(async (ep) => {
            const episodePosterUrl = IMG_BASE_URL + ep.still_path;
            let rowItem = serverLibrary.find(
              (item) =>
                item.title === show &&
                item.season === ep.season_number &&
                item.episode === ep.episode_number,
            )!;
            return {
              number: ep.episode_number,
              blur_data: ep.still_path
                ? await generateBase64Image(ep.still_path)
                : null,
              release_date: ep.air_date,
              tmdb_id: ep.id,
              plot: ep.overview,
              title: ep.name,
              previews_amount: rowItem.previews,
              poster: episodePosterUrl,
              rating: ep.vote_average,
              duration: parseFloat(rowItem.duration),
              src: rowItem.href,
              season_id: mySeason.id,
              external_subs: rowItem.subs,
            };
          }),
        ),
        skipDuplicates: true,
      });
    }
  }
  await prisma.shows.deleteMany({
    where: { tmdb_id: { notIn: serverShowsTmdbIds } },
  });
  return new NextResponse("done", { status: 200 });
}
