import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../utils/Tokendecode";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
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
  }
}
