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
  if (req.method == "GET") {
  }
  prisma.$disconnect();
}
