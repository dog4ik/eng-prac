import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import TokenDecode from "../../../utils/Tokendecode";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method == "GET") {
    const shows = await prisma.shows.findMany({
      include: { _count: { select: { Season: {} } } },
    });

    res.send(
      shows.map((show) => {
        return { ...show, _count: undefined, seasonsCount: show._count.Season };
      })
    );
  }
}
