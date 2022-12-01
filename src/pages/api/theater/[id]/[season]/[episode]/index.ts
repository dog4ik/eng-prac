import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../../../utils/Tokendecode";
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
    console.log(req.query);
    const episode = await prisma.episode.findFirst({
      where: {
        Season: { showsId: query.id, number: parseInt(query.season) },
        number: parseInt(query.episode),
      },
    });
    res.send(episode);
  }
  prisma.$disconnect();
}
