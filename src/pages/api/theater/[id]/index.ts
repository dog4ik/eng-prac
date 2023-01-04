import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    if (!req.query.id) {
      res.status(400).send("no ID specified");
      return;
    }
    const seasons = await prisma.shows.findFirst({
      where: { id: req.query.id.toString() },
      include: {
        Season: {
          select: {
            number: true,
            poster: true,
            id: true,
            _count: { select: { Episodes: {} } },
          },
          orderBy: { number: "asc" },
        },
      },
    });
    const response = {
      title: seasons?.title,
      releaseDate: seasons?.releaseDate,
      poster: seasons?.poster,
      backdrop: seasons?.backdrop,
      rating: seasons?.rating,
      plot: seasons?.plot,
      seasons: seasons?.Season.map((s) => {
        return {
          number: s.number,
          poster: s.poster,
          id: s.id,
          episodesCount: s._count.Episodes,
        };
      }),
    };
    res.send(response);
  }
}
