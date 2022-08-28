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
    res.status(401).send("token expired");
    return;
  }
  if (req.method == "POST") {
    prisma.wordbook
      .updateMany({
        where: { category: "liked", userId: user_id },
        data: {
          words: {
            push: { eng: req.body.eng, rus: req.body.rus },
          },
        },
      })
      .then((data) => res.status(204).json(data))
      .catch((err) => res.status(400).send(err));
  }
  if (req.method == "DELETE") {
    prisma.wordbook.updateMany({
      where: { userId: user_id, category: "liked" },
      data: {
        words: {
          deleteMany: {
            where: { OR: [{ rus: req.body.word }, { eng: req.body.word }] },
          },
        },
      },
    });
  }
}
