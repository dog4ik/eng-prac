import { NextApiRequest, NextApiResponse } from "next";
import PrismaClient from "../../../../../prisma/PrismaClient";
import TokenDecode from "../../../../utils/Tokendecode";
const prisma = PrismaClient;
type BodyProps = {
  file: string;
  id: string;
};
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let user_id = TokenDecode(req.headers.authorization);
  if (user_id == null) {
    res.status(401).send("jwt expired");
    return;
  }
  const body = req.body as BodyProps;
  let array: Array<string> = body.file.replaceAll(/\r/g, "").split(/\n+/g);

  let failed = 0;

  let words: Array<{ eng: string; rus: string }> = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i].split(",").length !== 4) {
      failed++;
      continue;
    }
    const [firstLang, secondLang, first, second] = array[i].split(",");
    if (firstLang === "English" && secondLang === "Russian") {
      if (first.search(/[a-z]/i) == -1) continue;
      if (second.search(/[а-я]/i) == -1) continue;
      words.push({ eng: first, rus: second });
    }
    if (firstLang === "Russian" && secondLang === "English") {
      if (first.search(/[а-я]/i) == -1) continue;
      if (second.search(/[a-z]/i) == -1) continue;
      words.push({ eng: second, rus: first });
    }
  }
  console.log(failed);

  await prisma.user
    .update({
      data: {
        Wordbook: {
          update: {
            data: {
              words: { createMany: { data: words, skipDuplicates: true } },
            },
            where: { id: body.id },
          },
        },
      },
      where: { id: user_id },
    })
    .then(() => res.status(200).send("done"))
    .catch((err) => res.status(400).send(err));
  prisma.$disconnect();
}
