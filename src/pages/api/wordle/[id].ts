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
      .findFirstOrThrow({
        where: { userId: user_id, id: req.query.id?.toString() },
      })
      .then((data) => res.status(200).send(data))
      .catch(() => {
        res.status(404).send("not found");
      });
  }

  if (req.method === "POST") {
    const wordle = await prisma.wordle.findFirst({
      where: { userId: user_id, id: req.query.id?.toString() },
    });
    if (
      wordle?.word === req.body.word ||
      wordle?.maxTries === wordle!.tries.length + 1
    ) {
      await prisma.wordle
        .updateMany({
          where: { userId: user_id, id: req.query.id?.toString() },
          data: {
            tries: { push: req.body.word },
            finishDate: new Date(),
          },
        })
        .then(() => res.status(200).send("done"))
        .catch((err) => res.status(400).send("Answer error"));
    } else {
      await prisma.wordle
        .updateMany({
          where: { userId: user_id, id: req.query.id?.toString() },
          data: {
            tries: { push: req.body.word },
          },
        })
        .then(() => res.status(200).send("done"))
        .catch((err) => res.status(400).send("Answer error"));
    }
  }
  prisma.$disconnect();
}
