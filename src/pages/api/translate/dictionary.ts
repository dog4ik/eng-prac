import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";
interface API {
  word: string;
  phonetic: string;
  phonetics: Phonetic[];
  meanings: Meaning[];
  license: License;
  sourceUrls: string[];
}
interface License {
  name: string;
  url: string;
}
interface Meaning {
  partOfSpeech: string;
  definitions: Definition[];
  synonyms: string[];
  antonyms: string[];
}
interface Definition {
  definition: string;
  synonyms: any[];
  antonyms: any[];
  example?: string;
}
interface Phonetic {
  text: string;
  audio: string;
  sourceUrl?: string;
  license?: License;
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

    const response: void | AxiosResponse<API[]> = await axios
      .get(`https://api.dictionaryapi.dev/api/v2/entries/en/${req.body.text}`)
      .catch((err) => {
        res.status(200).send([]);
        return;
      });

    res.status(200).json({
      synonyms: response?.data[0].meanings[0].synonyms,
    });
    return;
  } else res.status(405).send("method is not supported");
}
