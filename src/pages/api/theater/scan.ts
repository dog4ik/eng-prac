import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma/PrismaClient";
import {
  TmdbShowSeason,
  LibItem,
  MyLibrary,
  TmdbSearchShow,
  TmdbSeasonEpisode,
} from "./tmdb-api";

type ReqestBody = {
  language?: string;
};

const generateBase64Image = async (path: string) => {
  return await axios
    .get("https://image.tmdb.org/t/p/w45" + path, {
      responseType: "arraybuffer",
    })
    .then((data) => Buffer.from(data.data, "binary").toString("base64"));
};

const filterEpisodes = (
  local: {
    number: number;
    src: string;
    subSrc: string | null;
  }[],
  tmdb: TmdbSeasonEpisode[]
) => {
  return tmdb
    .filter((te) => local.map((le) => le.number).includes(te.episode_number))
    .map((item) => {
      const e = local.find((i) => i.number == item.episode_number);
      return {
        ...item,
        src: e!.src,
        subSrc: e!.subSrc,
      };
    });
};
const IMG_BASE_URL = "https://image.tmdb.org/t/p/original";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    const body = req.body as ReqestBody;
    if (req.socket.remoteAddress !== "::ffff:127.0.0.1") {
      res.status(403).send("Forbidden");
      return;
    }
    const tmdbApi = axios.create({
      proxy: {
        protocol: "http",
        host: "94.228.122.168",
        port: 3128,
      },
      baseURL: "http://api.themoviedb.org/3",
      params: {
        api_key: process.env.TMDB_TOKEN,
        language: body.language ?? "en-US",
      },
      headers: {
        "Accept-Encoding": "compress",
      },
    });
    const library = (
      await axios.get<LibItem[]>(process.env.MEDIA_SERVER_LINK + "/show")
    ).data;
    if (library.length == 0 || !library) {
      await prisma.shows.deleteMany();
      res.status(200).send("empty library");
      return;
    }

    const myFreshLibrary: {
      showsIds: number[];
      seasonsIds: number[];
      episodesIds: Set<number>;
    } = { episodesIds: new Set(), seasonsIds: [], showsIds: [] };

    for (let i = 0; i < library.length; i++) {
      const tmdbSearchResult = await tmdbApi
        .get<TmdbSearchShow>("/search/tv", {
          params: { query: library[i].title },
        })
        .catch(() => {
          return null;
        });
      if (tmdbSearchResult === null) continue;
      const season = await tmdbApi
        .get<TmdbShowSeason>(
          `/tv/${tmdbSearchResult.data.results[0].id}/season/${library[i].season}`
        )
        .catch(() => null);
      if (season === null) continue;
      const myEpisodes: MyLibrary[] = filterEpisodes(
        library[i].episodes,
        season.data.episodes
      );
      let showBlurdata: string | null = null;
      let seasonBlurdata: string | null = null;
      let episodesBlurdata: Map<number, string> = new Map();
      if (tmdbSearchResult.data.results[0].poster_path) {
        showBlurdata = await generateBase64Image(
          tmdbSearchResult.data.results[0].poster_path
        );
      }
      if (season.data.poster_path) {
        seasonBlurdata = await generateBase64Image(
          season.data.poster_path
        ).catch(() => null);
      }
      for (let i = 0; i < myEpisodes.length; i++) {
        const episode = myEpisodes[i];
        if (episode.still_path) {
          const base64 = await generateBase64Image(episode.still_path).catch(
            () => null
          );
          if (base64 != null) episodesBlurdata.set(episode.id, base64);
        }
        myFreshLibrary.episodesIds.add(episode.id);
      }
      myFreshLibrary.showsIds.push(tmdbSearchResult.data.results[0].id);
      myFreshLibrary.seasonsIds.push(season.data.id);

      await prisma.shows.upsert({
        create: {
          releaseDate: tmdbSearchResult.data.results[0].first_air_date,
          title: tmdbSearchResult.data.results[0].name,
          rating: tmdbSearchResult.data.results[0].vote_average.toString(),
          poster: IMG_BASE_URL + tmdbSearchResult.data.results[0].poster_path,
          blurData: showBlurdata,
          scannedDate: new Date(),
          backdrop:
            IMG_BASE_URL + tmdbSearchResult.data.results[0].backdrop_path,
          plot: tmdbSearchResult.data.results[0].overview,
          tmdbId: tmdbSearchResult.data.results[0].id,
          Season: {
            create: {
              number: season.data.season_number,
              releaseDate: season.data.air_date,
              poster: IMG_BASE_URL + season.data.poster_path,
              blurData: seasonBlurdata,
              scannedDate: new Date(),
              plot: season.data.overview,
              tmdbId: season.data.id,
              Episodes: {
                createMany: {
                  data: myEpisodes.map((item) => {
                    return {
                      number: item.episode_number,
                      src: item.src,
                      subSrc: item.subSrc,
                      title: item.name,
                      externalSubs: [],
                      releaseDate: item.air_date,
                      rating: item.vote_average.toString(),
                      poster: IMG_BASE_URL + item.still_path,
                      blurData: episodesBlurdata.get(item.id) ?? null,
                      plot: item.overview,
                      tmdbId: item.id,
                    };
                  }),
                  skipDuplicates: true,
                },
              },
            },
          },
        },
        update: {
          Season: {
            upsert: {
              create: {
                number: season.data.season_number,
                releaseDate: season.data.air_date,
                poster: IMG_BASE_URL + season.data.poster_path,
                blurData: seasonBlurdata,
                scannedDate: new Date(),
                plot: season.data.overview,
                tmdbId: season.data.id,
                Episodes: {
                  createMany: {
                    data: myEpisodes.map((item) => {
                      return {
                        number: item.episode_number,
                        src: item.src,
                        subSrc: item.subSrc,
                        title: item.name,
                        externalSubs: [],
                        releaseDate: item.air_date,
                        rating: item.vote_average.toString(),
                        poster: IMG_BASE_URL + item.still_path,
                        blurData: episodesBlurdata.get(item.id) ?? null,
                        plot: item.overview,
                        tmdbId: item.id,
                      };
                    }),
                    skipDuplicates: true,
                  },
                },
              },
              update: {
                Episodes: {
                  createMany: {
                    data: myEpisodes.map((item) => {
                      return {
                        number: item.episode_number,
                        src: item.src,
                        subSrc: item.subSrc,
                        title: item.name,
                        externalSubs: [],
                        releaseDate: item.air_date,
                        rating: item.vote_average.toString(),
                        poster: IMG_BASE_URL + item.still_path,
                        blurData: episodesBlurdata.get(item.id) ?? null,
                        plot: item.overview,
                        tmdbId: item.id,
                      };
                    }),
                    skipDuplicates: true,
                  },
                },
              },
              where: { tmdbId: season.data.id },
            },
          },
        },
        where: { tmdbId: tmdbSearchResult.data.results[0].id },
      });
    }
    await prisma.season.deleteMany({
      where: { tmdbId: { notIn: myFreshLibrary.seasonsIds } },
    });
    await prisma.shows.deleteMany({
      where: { tmdbId: { notIn: myFreshLibrary.showsIds } },
    });
    await prisma.episode.deleteMany({
      where: { tmdbId: { notIn: Array.from(myFreshLibrary.episodesIds) } },
    });
    res.status(200).send("done");
  }
}
