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
    await prisma.user
      .update({
        data: {
          likedWords: {
            createMany: { data: { eng: req.body.eng, rus: req.body.rus } },
          },
        },
        where: { id: user_id },
      })
      .then(() => res.status(201).send("liked"))
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  }
  if (req.method === "GET") {
    let data = await prisma.user
      .findFirst({
        where: { id: user_id },
        select: {
          likedWords: { orderBy: { createdAt: "desc" } },
        },
      })
      .catch((err) => res.status(400).send("words are unavailble"));
    res.status(200).send(data?.likedWords);
  }
  if (req.method === "DELETE") {
    await prisma.user.update({
      data: {
        likedWords: {
          deleteMany: {
            likedById: user_id,
            eng: req.body.eng,
            rus: req.body.rus,
          },
        },
      },
      where: { id: user_id },
    });
    res.send("word removed");
  }
  prisma.$disconnect();
}
