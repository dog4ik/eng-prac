import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../prisma/PrismaClient";
import * as jwt from "jsonwebtoken";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user_id: string;
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  jwt.verify(
    token!,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err: any, token_data: any) => {
      if (err) {
        if (err.message == "jwt malformed") {
          res.status(400).send(err.message);
          return;
        }
        console.log(err.message);
        res.status(401).send("jwt expired");
        return;
      } else {
        user_id = token_data.id;
        const user = await prisma.user
          .findUnique({
            where: { id: user_id! },
            select: {
              email: true,
              name: true,
              id: true,
              notifications: true,
              role: true,
            },
          })
          .catch((err) => {
            console.log(err);

            res.status(400).send(err);
            return;
          });
        res.status(200).json(user);
        return;
      }
    }
  );
  prisma.$disconnect();
}
