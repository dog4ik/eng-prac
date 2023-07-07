import axios from "axios";
import prisma from "../../../../prisma/PrismaClient";
import { NextApiRequest, NextApiResponse } from "next";
import { TmdbSearchShow, TmdbShowSeason } from "./tmdbTypes";

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
type BackdropSaveReq = {
  url: string;
  show: string;
};
type PosterSaveReq = {
  url: string;
  show: string;
  season?: number;
  episode?: number;
};
const generateBase64Image = async (path: string) => {
  return await axios
    .get("https://image.tmdb.org/t/p/w45" + path, {
      responseType: "arraybuffer",
    })
    .then((data) => Buffer.from(data.data, "binary").toString("base64"));
};
const uploadBackdrop = async (reqest: BackdropSaveReq) => {
  const serverURL = process.env.MEDIA_SERVER_LINK;
  if (!serverURL) throw Error("env");
  return await axios
    .post<string>(`${serverURL}/savebackdrop`, reqest)
    .then((data) => `${serverURL}${data.data}/backdrop`);
};
const uploadPoster = async (reqest: PosterSaveReq) => {
  const serverURL = process.env.MEDIA_SERVER_LINK;
  if (!serverURL) throw Error("env");
  return await axios
    .post<string>(`${serverURL.toLowerCase()}/saveposter`, reqest)
    .then((data) => `${serverURL}${data.data}/poster`);
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
    //make it here
    let showPosterUrl = await uploadPoster({
      url: IMG_BASE_URL + topSearchResult.poster_path,
      show,
    });
    let showBackdropUrl = await uploadBackdrop({
      url: IMG_BASE_URL + topSearchResult.backdrop_path,
      show,
    });
    console.log(showPosterUrl, showBackdropUrl);

    let myShow = await prisma.shows.upsert({
      where: { tmdbId: topSearchResult.id },
      create: {
        tmdbId: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: showPosterUrl,
        backdrop: showBackdropUrl,
        rating: topSearchResult.vote_average,
        originalLanguage: topSearchResult.original_language,
        releaseDate: topSearchResult.first_air_date,
        blurData: showPosterBlur,
      },
      update: {
        tmdbId: topSearchResult.id,
        title: topSearchResult.name,
        plot: topSearchResult.overview,
        poster: showPosterUrl,
        backdrop: showBackdropUrl,
        rating: topSearchResult.vote_average,
        originalLanguage: topSearchResult.original_language,
        releaseDate: topSearchResult.first_air_date,
        blurData: showPosterBlur,
      },
      select: {
        id: true,
      },
    });
    await prisma.season.deleteMany({
      where: {
        showsId: myShow.id,
        number: { notIn: Array.from(seasons.keys()) },
      },
    });
    //map seasons
    for (const [season, episodes] of seasons) {
      //skip unnessasary api call
      console.log(myShow.id, season);
      const localSeason = await prisma.season.findFirst({
        where: { showsId: myShow.id, number: season },
        select: { Episodes: { select: { number: true } }, id: true },
      });
      if (
        localSeason &&
        episodes.every((ep) =>
          localSeason.Episodes.map((ep) => ep.number).includes(ep)
        )
      ) {
        await prisma.episode.deleteMany({
          where: { seasonId: localSeason.id, number: { notIn: episodes } },
        });
        console.log(`Skipped ${season} season of ${topSearchResult.name}`);
        continue;
      }

      console.log(`Getting ${season} season of ${topSearchResult.name}`);
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
      //make it also here
      //TODO: handle error
      const seasonPosterUrl = await uploadPoster({
        url: IMG_BASE_URL + tmdbSeason.poster_path,
        show,
        season: tmdbSeason.season_number,
      });
      let mySeason = await prisma.season.upsert({
        where: { tmdbId: tmdbSeason.id },
        create: {
          number: tmdbSeason.season_number,
          poster: seasonPosterUrl,
          plot: tmdbSeason.overview,
          tmdbId: tmdbSeason.id,
          releaseDate: tmdbSeason.air_date,
          showsId: myShow.id,
          blurData: seasonPosterBlur,
        },
        update: {
          number: tmdbSeason.season_number,
          poster: seasonPosterUrl,
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
      await prisma.episode.deleteMany({
        where: {
          seasonId: mySeason.id,
          tmdbId: { notIn: tmdbEpisodes.map((item) => item.id) },
        },
      });
      //Handle Episodes
      //make it also here
      await prisma.episode.createMany({
        data: await Promise.all(
          tmdbEpisodes.map(async (ep) => {
            const episodePosterUrl = await uploadPoster({
              url: IMG_BASE_URL + ep.still_path,
              show,
              season: ep.season_number,
              episode: ep.episode_number,
            });
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
              previewsAmount: rowItem.previews,
              poster: episodePosterUrl,
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
  }
  await prisma.shows.deleteMany({
    where: { tmdbId: { notIn: serverShowsTmdbIds } },
  });
  res.status(200).send("done");
}
