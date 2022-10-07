import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
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
  if (req.method == "POST") {
    if (req.body.text.trim() == "") {
      console.log("prevented useless fetch");
      res.status(200).json({
        translations: [
          {
            text: "",
          },
        ],
      });
      return;
    }
    const translate_token = await prisma.helper
      .findFirst()
      .catch((err) => console.log("cant find token"));
    await axios
      .post(
        "https://translate.api.cloud.yandex.net/translate/v2/translate",
        {
          texts: req.body.text,
          folderId: "b1gnh7tkfjoto94lju6t",
          targetLanguageCode: "ru",
          sourceLanguageCode: "en",
        },
        {
          headers: {
            Authorization: `Bearer ${translate_token?.ya_token}`,
          },
        }
      )
      .then((response) => {
        res.status(200).json(response.data);
        return;
      })
      .catch(async (err) => {
        if (err.response.status === 401 && err.response.data.code === 16) {
          const token = await refreshIAM();
          err.config.headers["Authorization"] = "Bearer " + token;
          await axios.request(err.config).then((data) => {
            res.status(200).json(data.data);
            return;
          });
        } else {
          res.status(500).send("Service is unavailble");
          return;
        }
        res.status(500).send("Service is unavaible");
      });
  } else {
    res.status(405).send(req.method + " is not supported");
  }
}
