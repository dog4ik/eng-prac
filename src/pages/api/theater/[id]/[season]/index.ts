import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../../utils/Tokendecode";
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
      include: { Episodes: { orderBy: { number: "asc" } } },
    });
    res.send({
      parentSeason: {
        ...episodes,
        Episodes: undefined,
      },
      episodes: episodes?.Episodes,
    });
  }
  prisma.$disconnect();
}
