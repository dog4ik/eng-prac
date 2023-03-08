import axios from "axios";
import prisma from "../../../../prisma/PrismaClient";
import { NextApiRequest, NextApiResponse } from "next";
import { TmdbSearchShow, TmdbShowSeason } from "./tmdb-api";

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
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as ReqBody;
  const tmdbApi = axios.create({
    baseURL: "http://api.themoviedb.org/3",
    params: {
      api_key: process.env.TMDB_TOKEN,
      language: body.language ?? "en-US",
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
    new Map()
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
    let myShow = await prisma.shows.upsert({
      where: { tmdbId: topSearchResult.id },
      create: {
        tmdbId: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: IMG_BASE_URL + topSearchResult.poster_path,
        backdrop: IMG_BASE_URL + topSearchResult.backdrop_path,
        rating: topSearchResult.vote_average,
        originalLanguage: topSearchResult.original_language,
        releaseDate: topSearchResult.first_air_date,
        blurData: showPosterBlur,
      },
      update: {
        tmdbId: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: IMG_BASE_URL + topSearchResult.poster_path,
        backdrop: IMG_BASE_URL + topSearchResult.backdrop_path,
        rating: topSearchResult.vote_average,
        originalLanguage: topSearchResult.original_language,
        releaseDate: topSearchResult.first_air_date,
        blurData: showPosterBlur,
      },
      select: { id: true },
    });
    await prisma.season.deleteMany({
      where: {
        showsId: myShow.id,
        number: { notIn: Array.from(seasons.keys()) },
      },
    });
    //map seasons
    for (const [season, episodes] of seasons) {
      const tmdbSeason = await tmdbApi
        .get<TmdbShowSeason>(
          `/tv/${tmdbSearchResult.results[0].id}/season/${season}`
        )
        .then((data) => data.data)
        .catch(null);
      if (tmdbSeason === null) continue;
      let seasonPosterBlur = tmdbSeason.poster_path
        ? await generateBase64Image(tmdbSeason.poster_path).catch(null)
        : null;
      let mySeason = await prisma.season.upsert({
        where: { tmdbId: tmdbSeason.id },
        create: {
          number: tmdbSeason.season_number,
          poster: IMG_BASE_URL + tmdbSeason.poster_path,
          plot: tmdbSeason.overview,
          tmdbId: tmdbSeason.id,
          releaseDate: tmdbSeason.air_date,
          showsId: myShow.id,
          blurData: seasonPosterBlur,
        },
        update: {
          number: tmdbSeason.season_number,
          poster: IMG_BASE_URL + tmdbSeason.poster_path,
          plot: tmdbSeason.overview,
          tmdbId: tmdbSeason.id,
          releaseDate: tmdbSeason.air_date,
          showsId: myShow.id,
          blurData: seasonPosterBlur,
        },
        select: { id: true },
      });
      if (!tmdbSeason?.episodes) continue;
      //filter all episodes and those who in response
      let tmdbEpisodes = tmdbSeason.episodes.filter((ep) =>
        episodes.includes(ep.episode_number)
      );
      console.log(tmdbEpisodes);
      await prisma.episode.deleteMany({
        where: {
          seasonId: mySeason.id,
          tmdbId: { notIn: tmdbEpisodes.map((item) => item.id) },
        },
      });
      //Handle Episodes
      await prisma.episode.createMany({
        data: await Promise.all(
          tmdbEpisodes.map(async (ep) => {
            let rowItem = serverLibrary.find(
              (item) =>
                item.title === show &&
                item.season === ep.season_number &&
                item.episode === ep.episode_number
            )!;
            return {
              number: ep.episode_number,
              blurData: ep.still_path
                ? await generateBase64Image(ep.still_path)
                : null,
              releaseDate: ep.air_date,
              tmdbId: ep.id,
              plot: ep.overview,
              title: ep.name,
              poster: IMG_BASE_URL + ep.still_path,
              rating: ep.vote_average,
              duration: parseFloat(rowItem.duration),
              src: rowItem.href,
              seasonId: mySeason.id,
              externalSubs: rowItem.subs,
            };
          })
        ),
        skipDuplicates: true,
      });
    }
    await prisma.shows.deleteMany({
      where: { tmdbId: { notIn: serverShowsTmdbIds } },
    });
  }
  res.status(200).send("done");
}
