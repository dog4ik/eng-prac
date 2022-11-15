import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import TokenDecode from "../../../utils/Tokendecode";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user_id: string | null;
  user_id = TokenDecode(req.headers.authorization);
  if (user_id == null) {
    res.status(401).send("jwt expired");
    return;
  }

  if (req.method === "GET") {
    await prisma.wordle
      .findMany({
        where: { userId: user_id },
        orderBy: { createdAt: "desc" },
      })
      .then((data) => res.status(200).send(data))
      .catch(() => {
        res.status(404).send("not found");
      });
  }
  if (req.method === "POST") {
    type bodyType = {
      maxTries: number;
      sourceList: string[];
    };
    const body: bodyType = req.body;

    const words = await prisma.words
      .findMany({
        where: {
          Wordbook: { userId: user_id },
          wordbookId: { in: body.sourceList },
        },
      })
      .then((data) =>
        data
          .map((word) => word.eng)
          .filter((item) => item.length > 3 && item.length < 6)
      );
    if (words.length == 0) {
      res.status(400).send("Not enough words");
      return;
    }
    await prisma.wordle
      .create({
        data: {
          userId: user_id,
          maxTries: body.maxTries,
          word: words[Math.floor(Math.random() * words.length)].toLowerCase(),
        },
      })
      .then((data) => res.status(201).send(data))
      .catch(() => res.status(400).send("Wordle add error"));
  }
  prisma.$disconnect();
}
