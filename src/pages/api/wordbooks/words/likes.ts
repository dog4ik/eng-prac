import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../utils/Tokendecode";
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
  if (req.method === "POST") {
    await prisma.collection
      .updateMany({
        where: {
          userId: user_id,
          likedWords: { none: { eng: req.body.eng } },
        },
        data: {
          likedWords: {
            push: { eng: req.body.eng, rus: req.body.rus },
          },
        },
      })
      .then((data) => res.status(201).send("Liked"))
      .catch((err) => res.status(400).send(err));
  }
  if (req.method === "GET") {
    prisma.collection
      .findFirst({
        where: { userId: user_id },
        select: {
          likedWords: true,
        },
      })
      .then((data) => {
        res.status(200).json(data?.likedWords.reverse());
        return;
      })
      .catch((err) => res.status(400).send(err));
  }
  if (req.method === "DELETE") {
    prisma.collection
      .updateMany({
        where: { userId: user_id },
        data: {
          likedWords: {
            deleteMany: {
              where: { eng: req.body.eng },
            },
          },
        },
      })
      .then((data) => {
        res.status(200).send("word removed");
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
}
