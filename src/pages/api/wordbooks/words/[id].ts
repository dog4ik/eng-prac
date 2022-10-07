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
    res.status(401).send("token expired");
    return;
  }
  if (req.query.id === undefined) {
    res.send("ID not provided");
    return;
  }
  if (req.method == "DELETE") {
    const old = await prisma.wordbook
      .findFirst({
        where: {
          userId: user_id,
          id: req.query.id.toString(),
        },
      })
      .catch((err) => console.log(err));
    let filtered;
    if (typeof req.body.word == "string") {
      filtered = old?.words.filter((item: any) => item.eng != req.body.word);
    }
    if (typeof req.body.word == "object") {
      filtered = old?.words.filter(
        (item: any) => !req.body.word.includes(item.eng)
      );
    }
    await prisma.wordbook
      .updateMany({
        where: {
          id: req.query.id.toString(),
          userId: user_id,
        },
        data: {},
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
    await prisma.wordbook
      .updateMany({
        where: { id: req.query.id.toString(), userId: user_id },
        data: {
          words: {
            push: { eng: req.body.eng, rus: req.body.rus, date: Date.now() },
          },
        },
      })
      .then((data) => res.status(200).send("add"))
      .catch((err) => res.status(400).send(err));
  }
  if (req.method == "PATCH") {
    await prisma.wordbook
      .updateMany({
        where: { id: req.query.id.toString(), userId: user_id },
        data: {
          words: {
            updateMany: {
              where: { OR: [{ rus: req.body.rus }, { eng: req.body.eng }] },
              data: { rus: req.body.new_rus, eng: req.body.new_eng },
            },
          },
        },
      })
      .then((data) => {
        res.status(200).send("Deleted");
      });
  }
  prisma.$disconnect();
}
