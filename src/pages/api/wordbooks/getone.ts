import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import * as jwt from "jsonwebtoken";
import TokenDecode from "../../../utils/Tokendecode";
import { json } from "stream/consumers";
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
  console.log(req.body.id);
  await prisma.wordbook
    .findUnique({
      where: {
        id: req.body.id,
      },
    })
    .then((data) => {
      if (data?.private && data.userId != user_id) {
        res.status(403).send("its private :(");
        return;
      } else {
        res.status(200).json(data);
        return;
      }
    })
    .catch((err) => {
      res.status(400).send(err);
      return;
    });
}
