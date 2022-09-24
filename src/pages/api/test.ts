import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../prisma/PrismaClient";
export const prisma = PrismaClient;
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let response = await prisma.user.findMany();
  res.status(200).json(response);
  prisma.$disconnect();
}
