import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
<<<<<<< HEAD
    const seasons = await prisma.season.findMany({
      where: { showsId: req.query.id!.toString() },
      include: { _count: { select: { Episodes: {} } } },
    });
    const parentShow = await prisma.shows.findFirst({
      where: { id: req.query.id!.toString() },
    });

    res.send({
      parentShow: parentShow,
      seasons: seasons.map((season) => {
        return {
          ...season,
          _count: undefined,
          Shows: undefined,
          episodesCount: season._count.Episodes,
        };
      }),
    });
=======
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
>>>>>>> b000d47 (api improvements and deps updates)
  }
}
