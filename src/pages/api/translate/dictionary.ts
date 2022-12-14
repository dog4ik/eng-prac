import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
interface ApiWord {
  word: string;
  score: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (req.body.text.trim() == "" || req.body.text.split(" ").length > 1) {
      res.send([]);
      return;
    }
    const response = await axios
      .get<ApiWord[]>(
        `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
          req.body.text
        )}`
      )
      .then((data) => data.data)
      .catch((err) => {
        res.send([]);
        return;
      });
    console.log(encodeURIComponent("try to kill"));

    res.status(200).send(response);
    return;
  } else res.status(405).send("method is not supported");
}
