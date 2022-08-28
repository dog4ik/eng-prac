// await axios
// .post(
//   "https://api.nlpcloud.io/v1/nllb-200-3-3b/translation",
//   {
//     text: req.body.text,
//     source: req.body.source,
//     target: req.body.target,
//   },
//   {
//     headers: {
//       Authorization: "Token ",
//     },
//   }
// )

import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
async function GetIAM() {
  await axios
    .post("https://iam.api.cloud.yandex.net/iam/v1/tokens", {
      yandexPassportOauthToken: "",
    })
    .then((res) => {
      console.log(res.data.iamToken);
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
    await axios
      .post(
        "https://translate.api.cloud.yandex.net/translate/v2/translate",
        {
          texts: req.body.text,
          folderId: "b1gnh7tkfjoto94lju6t",
          targetLanguageCode: req.body.target,
          sourceLanguageCode: req.body.source,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.TRANSLATE_TOKEN}`,
          },
        }
      )
      .then((response) => {
        res.status(200).json(response.data);
        return;
      })
      .catch(async (err) => {
        // if (err.response.status === 401 && err.response.data.code === 16) {
        //   await GetIAM();
        //   console.log(err);
        //   err.config.headers["Authorization"] = "Bearer " + Token;
        //   axios.request(err.config).then((data) => {
        //     res.status(200).json(data.data);
        //     return;
        //   });
        // } else {
        //   res.status(500).send("Service is unavailble");
        //   return;
        // }
        res.status(500).send("Service is unavaible");
      });
  } else {
    res.status(405).send(req.method + " is not supported");
  }
}
