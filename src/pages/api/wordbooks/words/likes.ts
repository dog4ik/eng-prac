import axios from "axios";
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
    if (!req.body.eng || req.body.eng.length > 50) {
      res.status(400).send("word did not pass checks");
      return;
    }
    if (!req.body.rus) {
      req.body.rus = await axios
        .post<{ translations: { text: string }[] }>(
          "http://localhost:3000/api/translate",
          {
            text: req.body.eng,
          }
        )
        .then((data) => {
          console.log(data.data);

          return data.data.translations[0].text;
        });
    }
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
