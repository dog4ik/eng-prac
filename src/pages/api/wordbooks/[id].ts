import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import TokenDecode from "../../../utils/Tokendecode";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user_id: string | null;
  if (req.headers.authorization && req.headers.authorization != "Bearer null") {
    user_id = TokenDecode(req.headers.authorization);
    if (user_id == null) {
      res.status(401).send("jwt expired");
      return;
    }
  }
  if (req.method === "GET") {
    const response = await prisma.wordbook
      .findUnique({
        where: {
          id: req.query.id?.toString(),
        },
        include: {
          words: {
            where: { wordbookId: req.query.id?.toString() },
            select: {
              eng: true,
              rus: true,
              id: true,
              createdAt: true,
            },
          },
          _count: { select: { words: true } },
        },
      })
      .then((data) => {
        if (data?.private && data.userId != user_id) {
          res.status(403).send("its private :(");
          return null;
        }
        return data;
      })
      .catch((err) => {
        res.status(400).send(err);
        return;
      });

    if (response === null) {
      console.log("404: not found");
      res.status(404).send("not found");
      return;
    }
    res.status(200).json(response);
  }
  if (req.method === "PATCH") {
    if (req.body.name.toString().length > 150) {
      res.status(400).send("name length limit error");
      return;
    }
    await prisma.wordbook
      .updateMany({
        where: { id: req.query.id?.toString(), userId: user_id! },
        data: { name: req.body.name, private: req.body.private },
      })
      .then((data) => {
        res.status(200).send("updated");
      })
      .catch((err) => res.status(400).send("Error"));
  }
  if (req.method === "DELETE") {
    await prisma.wordbook
      .deleteMany({ where: { id: req.query.id?.toString(), userId: user_id! } })
      .then((data) => {
        res.status(200).send("deleted");
      })
      .catch((err) => {
        res.status(400).send("Failed delete");
      });
  }
  prisma.$disconnect();
}
