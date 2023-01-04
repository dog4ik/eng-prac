import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    const episodes = await prisma.season.findFirst({
      where: {
        showsId: req.query.id?.toString(),
        number: parseInt(req.query.season!.toString()),
      },
      select: {
        poster: true,
        number: true,
        plot: true,
        releaseDate: true,
        Episodes: {
          select: {
            poster: true,
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
    });
    const response = {
      poster: episodes?.poster,
      number: episodes?.number,
      plot: episodes?.plot,
      releaseDate: episodes?.releaseDate,
      episodesCount: episodes?.Episodes.length,
      episodes: episodes?.Episodes,
    };
    res.send(response);
  }
}
