import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
type ReqestBody = {
  password: string;
  language?: string;
};
type LibItem = {
  title: string;
  episodes: { number: number; src: string; subSrc: null | string }[];
  season: number;
};
type TmdbSeasonEpisode = {
  air_date: string;
  episode_number: number;
  crew: {
    id: number;
    credit_id: string;
    name: string;
    adult: boolean | null;
    gender: number;
    known_for_department: string;
    department: string;
    original_name: string;
    popularity: number;
    job: string;
    profile_path: string | null;
  }[];
  guest_stars: {
    adult: boolean;
    gender: number | null;
    known_for_department: string;
    original_name: string;
    popularity: number;
    id: number;
    name: string;
    credit_id: string;
    character: string;
    order: number;
    profile_path: string | null;
  };
  name: string;
  overview: string;
  id: number;
  production_code: string | null;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
};
<<<<<<< HEAD

type TmdbShowSeason = {
  _id: string;
  air_date: string;
  episodes: TmdbSeasonEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
};
type TmdbSearchShow = {
  page: number;
  results: {
    poster_path: string | null;
    popularity: number;
    id: number;
    backdrop_path: string | null;
    vote_average: number;
    overview: string;
    first_air_date: string;
    origin_country: string[];
    genre_ids: number[];
    original_language: string;
    vote_count: number;
    name: string;
    original_name: string;
  }[];
  total_results: number;
  total_pages: number;
};

interface MyLibrary extends TmdbSeasonEpisode {
  src: string;
}

=======

type TmdbShowSeason = {
  _id: string;
  air_date: string;
  episodes: TmdbSeasonEpisode[];
  name: string;
  overview: string;
  id: number;
  poster_path: string | null;
  season_number: number;
};
type TmdbSearchShow = {
  page: number;
  results: {
    poster_path: string | null;
    popularity: number;
    id: number;
    backdrop_path: string | null;
    vote_average: number;
    overview: string;
    first_air_date: string;
    origin_country: string[];
    genre_ids: number[];
    original_language: string;
    vote_count: number;
    name: string;
    original_name: string;
  }[];
  total_results: number;
  total_pages: number;
};

interface MyLibrary extends TmdbSeasonEpisode {
  src: string;
  subSrc: string | null;
}

>>>>>>> b000d47 (api improvements and deps updates)
const filterEpisodes = (
  local: {
    number: number;
    src: string;
    subSrc: string | null;
  }[],
  tmdb: TmdbSeasonEpisode[]
) => {
  return tmdb
<<<<<<< HEAD
    .filter((ie) => local.map((le) => le.number).includes(ie.episode_number))
    .map((item) => {
      const src = local.find((i) => i.number == item.episode_number)!.src;
      return {
        ...item,
        src: src,
=======
    .filter((te) => local.map((le) => le.number).includes(te.episode_number))
    .map((item) => {
      const e = local.find((i) => i.number == item.episode_number);
      return {
        ...item,
        src: e!.src,
        subSrc: e!.subSrc,
>>>>>>> b000d47 (api improvements and deps updates)
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
    if (body.password !== process.env.PASSWORD) {
      res.status(403).send("Failed");
      return;
    }
    const tmdbApi = axios.create({
      proxy: {
        protocol: "http",
<<<<<<< HEAD
        host: "31.172.72.42",
=======
        host: "94.228.122.168",
>>>>>>> b000d47 (api improvements and deps updates)
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
    const library = (await axios.get<LibItem[]>("http://127.0.0.1:3001/show"))
      .data;
    if (library.length == 0 || !library) {
      res.status(400).send("empty library");
      return;
    }

    for (let i = 0; i < library.length; i++) {
<<<<<<< HEAD
      const tmdbSearch = await tmdbApi.get<TmdbSearchShow>("/search/tv", {
=======
      const tmdbSearchResult = await tmdbApi.get<TmdbSearchShow>("/search/tv", {
>>>>>>> b000d47 (api improvements and deps updates)
        params: { query: library[i].title },
      });

      const season = await tmdbApi.get<TmdbShowSeason>(
<<<<<<< HEAD
        `/tv/${tmdbSearch.data.results[0].id}/season/${library[i].season}`
=======
        `/tv/${tmdbSearchResult.data.results[0].id}/season/${library[i].season}`
>>>>>>> b000d47 (api improvements and deps updates)
      );
      const myEpisodes: MyLibrary[] = filterEpisodes(
        library[i].episodes,
        season.data.episodes
      );
      await prisma.shows.upsert({
        create: {
<<<<<<< HEAD
          releaseDate: tmdbSearch.data.results[0].first_air_date,
          title: tmdbSearch.data.results[0].name,
          rating: tmdbSearch.data.results[0].vote_average.toString(),
          poster: IMG_BASE_URL + tmdbSearch.data.results[0].poster_path,
          backdrop: IMG_BASE_URL + tmdbSearch.data.results[0].backdrop_path,
          plot: tmdbSearch.data.results[0].overview,
          tmdbId: tmdbSearch.data.results[0].id,
=======
          releaseDate: tmdbSearchResult.data.results[0].first_air_date,
          title: tmdbSearchResult.data.results[0].name,
          rating: tmdbSearchResult.data.results[0].vote_average.toString(),
          poster: IMG_BASE_URL + tmdbSearchResult.data.results[0].poster_path,
          backdrop:
            IMG_BASE_URL + tmdbSearchResult.data.results[0].backdrop_path,
          plot: tmdbSearchResult.data.results[0].overview,
          tmdbId: tmdbSearchResult.data.results[0].id,
>>>>>>> b000d47 (api improvements and deps updates)
          Season: {
            create: {
              number: season.data.season_number,
              releaseDate: season.data.air_date,
              poster: IMG_BASE_URL + season.data.poster_path,
              plot: season.data.overview,
              tmdbId: season.data.id,
              Episodes: {
                createMany: {
                  data: myEpisodes.map((item) => {
                    return {
                      number: item.episode_number,
                      src: item.src,
<<<<<<< HEAD
=======
                      subSrc: item.subSrc,
>>>>>>> b000d47 (api improvements and deps updates)
                      title: item.name,
                      externalSubs: [],
                      releaseDate: item.air_date,
                      rating: item.vote_average.toString(),
                      poster: IMG_BASE_URL + item.still_path,
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
<<<<<<< HEAD
          releaseDate: tmdbSearch.data.results[0].first_air_date,
          title: tmdbSearch.data.results[0].name,
          rating: tmdbSearch.data.results[0].vote_average.toString(),
          poster: IMG_BASE_URL + tmdbSearch.data.results[0].poster_path,
          backdrop: IMG_BASE_URL + tmdbSearch.data.results[0].backdrop_path,
          plot: tmdbSearch.data.results[0].overview,
=======
          releaseDate: tmdbSearchResult.data.results[0].first_air_date,
          title: tmdbSearchResult.data.results[0].name,
          rating: tmdbSearchResult.data.results[0].vote_average.toString(),
          poster: IMG_BASE_URL + tmdbSearchResult.data.results[0].poster_path,
          backdrop:
            IMG_BASE_URL + tmdbSearchResult.data.results[0].backdrop_path,
          plot: tmdbSearchResult.data.results[0].overview,
>>>>>>> b000d47 (api improvements and deps updates)
          Season: {
            upsert: {
              create: {
                number: season.data.season_number,
                releaseDate: season.data.air_date,
                poster: IMG_BASE_URL + season.data.poster_path,
                plot: season.data.overview,
                tmdbId: season.data.id,
                Episodes: {
                  createMany: {
                    data: myEpisodes.map((item) => {
                      return {
                        number: item.episode_number,
                        src: item.src,
<<<<<<< HEAD
=======
                        subSrc: item.subSrc,
>>>>>>> b000d47 (api improvements and deps updates)
                        title: item.name,
                        externalSubs: [],
                        releaseDate: item.air_date,
                        rating: item.vote_average.toString(),
                        poster: IMG_BASE_URL + item.still_path,
                        plot: item.overview,
                        tmdbId: item.id,
                      };
                    }),
                    skipDuplicates: true,
                  },
                },
              },
              update: {
                number: season.data.season_number,
                releaseDate: season.data.air_date,
                poster: IMG_BASE_URL + season.data.poster_path,
                plot: season.data.overview,
                Episodes: {
                  createMany: {
                    data: myEpisodes.map((item) => {
                      return {
                        number: item.episode_number,
                        src: item.src,
<<<<<<< HEAD
=======
                        subSrc: item.subSrc,
>>>>>>> b000d47 (api improvements and deps updates)
                        title: item.name,
                        externalSubs: [],
                        releaseDate: item.air_date,
                        rating: item.vote_average.toString(),
                        poster: IMG_BASE_URL + item.still_path,
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
<<<<<<< HEAD
        where: { tmdbId: tmdbSearch.data.results[0].id },
=======
        where: { tmdbId: tmdbSearchResult.data.results[0].id },
>>>>>>> b000d47 (api improvements and deps updates)
      });
    }

    res.status(200).send("done");
  }
  prisma.$disconnect();
}
