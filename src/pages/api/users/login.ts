import { NextApiRequest, NextApiResponse } from "next";
import * as bycript from "bcrypt";
import * as jwt from "jsonwebtoken";
import PrismaClient from "../../../../prisma/PrismaClient";
const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (user == null || user == undefined) {
    res.status(404).send("User not found");
  }
  if (await bycript.compare(req.body.password, user!.password)) {
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
      .status(200)
      .json({ access_token: access_token, refresh_token: refresh_token });
  } else {
    res.status(401).json({ error: "Error" });
  }
}
