import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
type ReqestBody = {
  password: string;
};
type LibItem = {
  title: string;
  episodes: { number: number; src: string }[];
  season: number;
};
type ImdbEpisodeType = {
  episode: number;
  id: string;
  season: number;
  title: string;
  titleType: string;
  year: number;
};
type ImdbSeason = { episodes: ImdbEpisodeType[]; season: number };
type ImdbImage = { height: number; imageUrl: string; width: number };
type ImdbPlot = { id: string; text: string };
type ImdbAC = {
  d: {
    i: ImdbImage;
    id: string;
    l: string;
    q: string;
    qid: string;
    rank: number;
    s: string;
    y: number;
    yr: string;
  }[];
  q: string;
};
type ImdbEpisodeDetails = {
  id: string;
  title: {
    episode: number;
    id: string;
    image: { height: number; url: string; width: number };
    season: number;
    title: string;
    titleType: string;
    year: number;
  };
  ratings: { rating: number; ratingCount: number; canRate: boolean };
  genres: string[];
  releaseDate: string;
  plotOutline: ImdbPlot;
  plotSummary: ImdbPlot;
};
type ImdbShowDetails = {
  id: string;
  title: {
    id: string;
    image: { height: number; url: string; width: number };
    numberOfEpisodes: number;
    seriesEndYear: number;
    seriesStartYear: number;
    title: string;
    titleType: string;
    year: number;
  };
  ratings: { rating: number; ratingCount: number; canRate: boolean };
  genres: string[];
  releaseDate: string;
  plotOutline: ImdbPlot;
  plotSummary: ImdbPlot;
};
interface MyLibrary extends ImdbEpisodeType {
  src: string;
}

const rapidApiOptions = {
  headers: {
    "X-RapidAPI-Key": "d3ce4c5cb9mshb9b2a76198d2d97p1e7aaejsn38dbaffa1a9b",
    "X-RapidAPI-Host": "imdb8.p.rapidapi.com",
  },
};

const filterEpisodes = (
  local: {
    number: number;
    src: string;
  }[],
  imdb: ImdbEpisodeType[]
) => {
  return imdb
    .filter((ie) => local.map((le) => le.number).includes(ie.episode))
    .map((item) => {
      const src = local.find((i) => i.number == item.episode)!.src;
      return { ...item, src: src };
    });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "POST") {
    const body = req.body as ReqestBody;
    if (body.password != process.env.PASSWORD) {
      res.status(403).send("Failed");
      return;
    }

    const library = (await axios.get<LibItem[]>("http://127.0.0.1:3001/show"))
      .data;
    if (library.length == 0 || !library) {
      res.status(400).send("empty library");
      return;
    }
    let myEpisodes: MyLibrary[] = [];
    for (let i = 0; i < library.length; i++) {
      const imdbAC = await axios.get<ImdbAC>(
        "https://imdb8.p.rapidapi.com/auto-complete",
        {
          params: { q: library[i].title },
          ...rapidApiOptions,
        }
      );
      const seasons = await axios.get<ImdbSeason[]>(
        "https://imdb8.p.rapidapi.com/title/get-seasons",
        {
          params: { tconst: imdbAC.data.d[0].id },
          ...rapidApiOptions,
        }
      );

      seasons.data.forEach((s) => {
        if (s.season != library[i].season) return;
        myEpisodes = [
          ...myEpisodes,
          ...filterEpisodes(library[i].episodes, s.episodes),
        ];
      });
      const details = await axios.get<ImdbShowDetails>(
        "https://imdb8.p.rapidapi.com/title/get-overview-details",
        {
          params: { tconst: imdbAC.data.d[0].id },
          ...rapidApiOptions,
        }
      );
      console.log("AC", imdbAC.data.d[0].id);

      await prisma.shows.upsert({
        create: {
          releaseYear: imdbAC.data.d[0].y,
          title: imdbAC.data.d[0].l,
          imdbId: imdbAC.data.d[0].id,
          rating: details.data.ratings.rating,
          img: imdbAC.data.d[0].i.imageUrl,
          plot: details.data.plotOutline.text,
        },
        update: {
          releaseYear: imdbAC.data.d[0].y,
          title: imdbAC.data.d[0].l,
          rating: details.data.ratings.rating,
          imdbId: imdbAC.data.d[0].id,
          img: imdbAC.data.d[0].i.imageUrl,
          plot: details.data.plotOutline.text,
        },
        where: { imdbId: imdbAC.data.d[0].id },
      });
    }
    let episodes: {
      releaseDate: string;
      src: string;
      title: string;
      externalSubs?: string;
      imdbId: string;
      img: string;
      plot: string;
      rating: number;
    }[] = [];
    for (let i = 0; i < myEpisodes.length; i++) {
      const episode = myEpisodes[i];
      episode.id = episode.id.split("/")[2];
      const details = await axios.get<ImdbEpisodeDetails>(
        "https://imdb8.p.rapidapi.com/title/get-overview-details",
        { params: { tconst: episode.id }, ...rapidApiOptions }
      );
      console.log(episode.id);
      episodes = [
        ...episodes,
        {
          imdbId: episode.id,
          img: details.data.title.image.url,
          plot: details.data.plotOutline.text,
          releaseDate: details.data.releaseDate,
          title: details.data.title.title,
          src: episode.src,
          rating: details.data.ratings.rating,
        },
      ];
    }
    await prisma.episode.createMany({
      data: [...episodes],
      skipDuplicates: true,
    });
    res.status(200).send(myEpisodes);
  }
  prisma.$disconnect();
}
