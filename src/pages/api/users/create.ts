import { NextApiRequest, NextApiResponse } from "next";
import * as bycript from "bcrypt";
import * as jwt from "jsonwebtoken";
import PrismaClient from "../../../../prisma/PrismaClient";
import axios from "axios";

const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const passwordHash = await bycript.hash(req.body.password, 10);
  const user = await prisma.user
    .create({
      data: {
        email: req.body.email,
        password: passwordHash,
      },
    })
    .catch((err) => {
      console.log("error");

      res.status(409).json({ error: err.message });
      return;
    });
  const access_token = jwt.sign(
    { id: user!.id },
    process.env.ACCESS_TOKEN_SECRET!,
    { expiresIn: "30m" }
  );
  const refresh_token = jwt.sign(
    { id: user!.id },
    process.env.REFRESH_TOKEN_SECRET!
  );
  res
    .status(201)
    .json({ access_token: access_token, refresh_token: refresh_token });

  prisma.$disconnect();
}
