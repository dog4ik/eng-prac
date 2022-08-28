import axios from "axios";
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
          name: req.body?.name,
          source: req.body?.source,
          target: req.body?.target,
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
    await prisma.wordbook
      .findMany({
        where: {
          userId: user_id,
        },
      })
      .then((data) => {
        res.status(200).json(data);
      })
      .catch((err) => {
        console.log(err);

        res.status(400).send(err);
      });
  }
}
