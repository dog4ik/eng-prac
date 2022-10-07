import { NextApiRequest, NextApiResponse } from "next";
import * as bycript from "bcrypt";
import * as jwt from "jsonwebtoken";
import PrismaClient from "../../../../prisma/PrismaClient";

const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const passwordHash = await bycript.hash(req.body.password, 10);
  await prisma.user
    .create({
      data: {
        email: req.body.email,
        password: passwordHash,
        Stats: { create: {} },
      },
    })
    .then((result) => res.status(201).send("User " + result.email + " Created"))
    .catch((err) => {
      res.status(409).json({ error: err.message });
    });
  prisma.$disconnect();
}
