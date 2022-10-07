import { useMutation } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FiBook, FiHeart, FiVolume2 } from "react-icons/fi";
import useDebounce from "../utils/useDebounce";
import { useLikeMutaton, useLikes, useUnLikeMutation } from "../utils/useLikes";
export const getServerSideProps: GetServerSideProps<{
  text?: string | string[] | null;
}> = async (context) => {
  const text = context.query.text ? context.query.text : null;
  return { props: { text } };
};
const Translate = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const input = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  useEffect(() => {
    input.current?.focus();
    if (props.text) input.current!.value = props.text.toString();
  }, []);
  const likesQuery = useLikes();
  const likeMutation = useLikeMutaton();
  const delikeMutation = useUnLikeMutation();
  const translateMutation = useMutation(
    (word: { text: string | undefined }) => {
      return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", word);
    }
  );
  const dictionaryMutation = useMutation(async (word: { text?: string }) => {
    return await axios
      .post<{ synonyms: string[] }>(
        process.env.NEXT_PUBLIC_API_LINK + "/translate/dictionary",
        word
      )
      .then((data) => data.data);
  });
  const playAudio = async () => {
    const res: AxiosResponse<ArrayBuffer> = await axios.post(
      "/api/translate/tts",
      { text: input.current?.value },
      {
        responseType: "arraybuffer",
      }
    );
    if (res.data.byteLength == 0) return;
    const byteArray = res.data;
    const context = new AudioContext();
    const audioBuffer = await context.decodeAudioData(byteArray);
    const source = context.createBufferSource();
    const gainNode = context.createGain();
    gainNode.gain.value = 0.3;
    gainNode.connect(context.destination);
    source.buffer = audioBuffer;
    source.connect(gainNode);
    source.start();
  };
  useEffect(() => {
    translateMutation.mutate({ text: input.current?.value });
    dictionaryMutation.mutate({ text: input.current?.value });
    router.push("?text=" + input.current?.value);
  }, [debouncedSearch]);

  return (
    <>
      <Head>
        <title>Translate</title>
      </Head>
      <div className="flex flex-1 flex-col gap-5 items-center">
        <div className="w-full flex justify-center items-center">
          <div className="w-2/3 px-5 py-2 border bg-white text-black rounded-xl flex  justify-center">
            <div className="basis-1/2 w-full h-32 flex border-r-2">
              <textarea
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                }}
                ref={input}
                maxLength={500}
                className="resize-none text-xl bg-white w-full flex-1 h-full outline-none"
              ></textarea>
              <div className="flex-col flex gap-2 pr-3">
                <FiVolume2
                  className="right-5 top-0 cursor-pointer stroke-gray-400 hover:stroke-gray-600"
                  size={35}
                  onClick={() => playAudio()}
                />
              </div>
            </div>
            <div className="basis-1/2 w-full">
              <div className="w-full h-full flex outline-none bg-white ">
                <div className="flex-1">
                  <span className="break-all">
                    {translateMutation.data?.data.translations[0].text}
                  </span>
                </div>
                <div className="flex-col flex gap-2">
                  <FiHeart
                    onClick={() => {
                      likesQuery.data?.find(
                        (item) => item.eng == input.current?.value
                      )
                        ? delikeMutation.mutate({ eng: input.current?.value })
                        : likeMutation.mutate({
                            eng: input.current?.value,
                            rus: translateMutation.data?.data.translations[0]
                              .text,
                          });
                    }}
                    className={
                      likesQuery.data?.find(
                        (item) => item.eng == input.current?.value
                      )
                        ? "self-center cursor-pointer duration-100 fill-pink-500 hover:fill-pink-400 stroke-pink-500 hover:stroke-pink-400"
                        : "self-center cursor-pointer duration-100 stroke-gray-400 hover:stroke-gray-600"
                    }
                    size={35}
                  ></FiHeart>
                  <FiBook
                    size={35}
                    className="self-center cursor-pointer duration-100 stroke-gray-400 hover:stroke-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-2/3 overflow-y-auto h-60 flex flex-wrap bg-white rounded-xl">
          {dictionaryMutation.isLoading ? (
            <p className="text-balack">Loading..</p>
          ) : (
            <div className="flex flex-col">
              {dictionaryMutation.data?.synonyms?.map((item, index) => (
                <p
                  className="text-black cursor-pointer"
                  key={index}
                  onClick={() => {
                    input.current!.value = item;
                    setSearchTerm(item);
                  }}
                >
                  {item}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Translate;
