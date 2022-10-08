import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import TokenDecode from "../../../utils/Tokendecode";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user_id = TokenDecode(req.headers.authorization);
  if (user_id == null) {
    res.status(401).send("jwt expired");
    return;
  }
  if (req.method == "POST") {
    await prisma.wordbook
      .create({
        data: {
          userId: user_id,
          name: req.body.name,
        },
      })
      .then((response) => {
        res.status(201).json(response);
        return;
      })
      .catch((err) => {
        res.status(400).json(err);
        return;
      });
  }
  if (req.method == "GET") {
    const response = await prisma.wordbook
      .findMany({
        where: {
          userId: user_id,
        },
        include: { _count: { select: { words: true } } },
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
    if (response === null) {
      res.status(404).send("not found");
    }
    res.status(200).json(response);
  }
  prisma.$disconnect();
}
