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
  if (req.query.id === undefined) {
    res.status(400).send("ID not provided");
    return;
  }
  if (req.method == "DELETE") {
    console.log(req.body);
    if (!req.body.word) res.status(400).send("no words provided");
    await prisma.user
      .update({
        data: {
          Wordbook: {
            update: {
              data: {
                words: { deleteMany: { eng: { in: req.body.word } } },
              },
              where: { id: req.query.id.toString() },
            },
          },
        },
        where: { id: user_id },
      })
      .catch((err) => {
        console.log(err);
        res.status(400).send(err);
      });
    res.status(200).send("Deleted");
  }
  if (req.method == "POST") {
    if (req.body.rus === undefined) {
      await axios
        .post("http://localhost:3000/api/translate", {
          text: req.body.eng,
        })
        .then((data) => {
          req.body.rus = data.data.translations[0].text;
        });
    }
    await prisma.user.update({
      data: {
        Wordbook: {
          update: {
            data: {
              words: {
                createMany: {
                  data: { eng: req.body.eng, rus: req.body.rus },
                  skipDuplicates: true,
                },
              },
            },
            where: { id: req.query.id.toString() },
          },
        },
      },
      where: { id: user_id },
    });
    res.send("done");
  }
  prisma.$disconnect();
}
