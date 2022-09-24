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
  if (req.method === "POST") {
    await prisma.collection
      .updateMany({
        where: {
          NOT: {
            likedWords: { hasSome: { eng: req.body.eng } },
          },
          AND: {
            userId: user_id,
          },
        },
        data: {
          likedWords: {
            push: {
              eng: req.body.eng,
              rus: req.body.rus,
              date: Date.now(),
            },
          },
        },
      })
      .then(() => res.status(201).send("liked"))
      .catch((err) => {
        console.log(err);
        res.status(500).send(err);
      });
  }
  if (req.method === "GET") {
    let data = await prisma.collection
      .findFirst({
        where: { userId: user_id },
        select: {
          likedWords: true,
        },
      })
      .catch((err) => res.status(400).send("words are unavailble"));
    res.status(200).send(data?.likedWords.reverse());
  }
  if (req.method === "DELETE") {
    // const old = await prisma.collection
    //   .findFirst({
    //     where: {
    //       userId: user_id,
    //     },
    //   })
    //   .catch((err) => console.log(err));
    // const filtered = old?.likedWords.filter(
    //   (item: any) => item.eng != req.body.eng
    // );
    // await prisma.collection
    //   .updateMany({
    //     where: { userId: user_id },
    //     data: {
    //       likedWords: {
    //         set: filtered,
    //       },
    //     },
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     res.status(400).json("database error");
    //   });
    const word = await prisma.collection
      .findFirst({
        where: { userId: user_id },
      })
      .catch((err) => console.log(err));

    let json = word!.likedWords.filter(
      (item: any) => item.eng == req.body.eng
    )[0];

    json = JSON.stringify(json);
    console.log(json);

    await prisma.$executeRaw`UPDATE "Collection" SET "likedWords" = array_remove("likedWords",${json}::jsonb) WHERE id = ${word?.id} AND ${json}::jsonb = ANY("likedWords") AND "userId" = ${user_id}`.catch(
      (err) => {
        console.log(err);
      }
    );
    res.send("word removed");
  }
  prisma.$disconnect();
}
