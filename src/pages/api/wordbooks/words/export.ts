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

  let array: Array<string> = req.body.file.replaceAll(`\r`, "").split("\n");

  let failed = 0;

  let words: Array<{ eng: string; rus: string }> = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].split(",").length !== 4) {
      failed++;
      continue;
    }
    const [source, target, first, second] = array[i].split(",");
    words.push({ eng: first, rus: second });
  }
  // const old = await prisma.wordbook.findMany({
  //   where: { userId: user_id, id: req.body.id },
  // });
  // await prisma.wordbook
  //   .updateMany({
  //     where: {
  //       id: req.body.id,
  //     },
  //     data: {
  //       words: {
  //         set: old[0].words.length == 0 ? words : [...old[0].words, ...words],
  //       },
  //     },
  //   })
  await prisma.user
    .update({
      data: {
        Wordbook: {
          update: {
            data: {
              words: { createMany: { data: words, skipDuplicates: true } },
            },
            where: { id: req.body.id },
          },
        },
      },
      where: { id: user_id },
    })
    .then(() => res.status(200).send("done"))
    .catch((err) => res.status(400).send(err));
  prisma.$disconnect();
}
