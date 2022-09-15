import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../utils/Tokendecode";
export const prisma = PrismaClient;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // let user_id = TokenDecode(req.headers.authorization);
  // if (user_id == null) {
  //   res.status(401).send("jwt expired");
  //   return;
  // }

  let array: Array<string> = req.body.file.replaceAll(`\r`, "").split("\n");

  console.table(array);
  let failed = 0;

  let words: Array<{ eng: string; rus: string }> = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].split(",").length !== 4) {
      failed++;
      continue;
    }
    const [source, target, first, second] = array[i].split(",");
    words.push({ eng: first, rus: second });
    console.log(array[i].split(","));
  }
  console.log(words);
  await prisma.wordbook
    .updateMany({
      where: {
        id: req.body.id,
      },
      data: {
        words: {
          push: words,
        },
      },
    })
    .then(() => res.status(200).send("done"))
    .catch((err) => res.status(400).send(err));
  res.json({ failed: failed });
}
