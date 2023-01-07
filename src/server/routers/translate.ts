import axios, { AxiosError } from "axios";
import { z } from "zod";
import * as url from "url";
import { router, procedure } from "../trpc";
import prisma from "../../../prisma/PrismaClient";
import { TRPCError } from "@trpc/server";

type ApiWord = {
  word: string;
  score: number;
};
type TranslateApi = {
  translations: { text: string }[];
};
async function refreshIAM() {
  return await axios
    .post("https://iam.api.cloud.yandex.net/iam/v1/tokens", {
      yandexPassportOauthToken: process.env.TRANSLATE_TOKEN,
    })
    .then(async (res) => {
      await prisma.helper.upsert({
        create: {
          id: "token",
          ya_token: res.data.iamToken,
        },
        update: {
          ya_token: res.data.iamToken,
        },
        where: { id: "token" },
      });
      console.log("yandex token updated");
      return res.data.iamToken;
    });
}

async function handleYandexToken(err: AxiosError) {
  const token = await refreshIAM().catch(() => {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "yandex is unavailable",
    });
  });
  console.log(token);
  err.config!.headers = { Authorization: "Bearer " + token };
  err.config!.data = JSON.parse(err.config!.data);
  return await axios
    .request(err.config!)
    .then((data) => data.data)
    .catch(() => {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "yandex services are not available",
      });
    });
}

export const translateRouter = router({
  autocomplete: procedure
    .input(z.object({ text: z.string().max(30) }))
    .mutation(async ({ input }) => {
      if (input.text.trim() == "") {
        return [];
      }
      const response = await axios
        .get<ApiWord[]>(
          `https://api.datamuse.com/sug?s=${encodeURIComponent(input.text)}`
        )
        .then((data) => data.data)
        .catch(() => {
          return [];
        });
      return response;
    }),

  dictionary: procedure
    .input(z.object({ text: z.string().max(30) }))
    .mutation(async ({ input }) => {
      if (input.text.trim() == "" || input.text.split(" ").length > 1) {
        return [];
      }
      const response = await axios
        .get<ApiWord[]>(
          `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(
            input.text
          )}`
        )
        .then((data) => data.data)
        .catch(() => {
          return [];
        });
      return response;
    }),

  translate: procedure
    .input(z.object({ text: z.string().max(200) }))
    .mutation(async ({ input }) => {
      if (input.text.trim() == "") {
        console.log("prevented useless fetch");
        return {
          translations: [
            {
              text: "",
            },
          ],
        };
      }
      const translate_token = await prisma.helper
        .findFirst()
        .catch(() => console.log("cant find token"));

      const response = await axios
        .post<TranslateApi>(
          "https://translate.api.cloud.yandex.net/translate/v2/translate",
          {
            texts: input.text,
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
        .then((res) => res.data)
        .catch(async (err) => {
          if (err.response.status === 401 && err.response.data.code === 16) {
            return await handleYandexToken(err);
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "yandex services are not available",
            });
          }
        });
      return response;
    }),

  textToSpeech: procedure
    .input(z.object({ text: z.string().max(40).min(1) }))
    .mutation(async ({ input }) => {
      const params = new url.URLSearchParams({
        folderId: "b1gnh7tkfjoto94lju6t",
        text: input.text,
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
          if (err.response.status === 401 && err.response.data.code === 16) {
            return await handleYandexToken(err);
          } else {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "yandex services are not available",
            });
          }
        });
      return voice;
    }),
});
