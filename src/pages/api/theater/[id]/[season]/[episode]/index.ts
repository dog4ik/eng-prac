import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
type queryType = {
  id: string;
  season: string;
  episode: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    const query = req.query as queryType;
    const episode = await prisma.episode.findFirst({
      where: {
        Season: { showsId: query.id, number: parseInt(query.season) },
        number: parseInt(query.episode),
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
        Season: {
          select: {
            number: true,
            showsId: true,
            Episodes: {
              select: {
                subSrc: true,
                title: true,
                poster: true,
                number: true,
                id: true,
              },
            },
          },
        },
      },
    });
    const response = {
      releaseDate: episode?.releaseDate,
      plot: episode?.plot,
      number: episode?.number,
      title: episode?.title,
      src: episode?.src,
      subSrc: episode?.subSrc,
      rating: episode?.rating,
      id: episode?.id,
      seasonNumber: episode?.Season?.number,
      showId: episode?.Season?.showsId,
      siblings: episode?.Season?.Episodes,
    };

    res.send(response);
  }
}
