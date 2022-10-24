import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import * as url from "url";
import PrismaClient from "../../../../prisma/PrismaClient";
const prisma = PrismaClient;
async function refreshIAM() {
  return await axios
    .post("https://iam.api.cloud.yandex.net/iam/v1/tokens", {
      yandexPassportOauthToken: process.env.TRANSLATE_TOKEN,
    })
    .then(async (res) => {
      await prisma.helper.updateMany({
        data: { ya_token: res.data.iamToken },
      });
      console.log("yandex token updated");
      return res.data.iamToken;
    })
    .catch((err) => console.log("yandex error"));
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    if (req.body.text.trim() == "") {
      res.status(200).send(null);
      console.log("prevented fetch");

      return;
    }
    const params = new url.URLSearchParams({
      folderId: "b1gnh7tkfjoto94lju6t",
      text: req.body.text,
      format: "mp3",
      voice: "john",
      lang: "en-US",
      speed: "0.8",
    });
    const yandex_token = await prisma.helper.findFirst();
    const voice = await axios
      .post(
        "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize",
        params.toString(),
        {
          headers: {
            Authorization: `Bearer ${yandex_token?.ya_token}`,
            "content-type": "application/x-www-form-urlencoded",
          },
          responseType: "arraybuffer",
        }
      )
      .then((data) => data.data)
      .catch(async (err) => {
        console.log(err);
        if (err.response.status == 401) {
          const token = await refreshIAM();
          err.config.headers["Authorization"] = "Bearer " + token;
          await axios.request(err.config).then((data) => {
            console.log(data);
            res.status(200).json(data.data);
            return;
          });
        } else {
          res.status(500).send("service is unavaible");
          return;
        }
      });
    res.send(voice);
  }
}
