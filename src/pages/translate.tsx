import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FiBook, FiHeart, FiVolume2 } from "react-icons/fi";
import useAudioMutation from "../utils/useAudioMutation";
import useDebounce from "../utils/useDebounce";
import { useLikeMutaton, useLikes, useUnLikeMutation } from "../utils/useLikes";
type ApiWord = {
  word: string;
  score: number;
};
type AutoCompleteProps = {
  word: string;
  onClick: (word: string) => void;
};
export const getServerSideProps: GetServerSideProps<{
  text?: string | string[] | null;
}> = async (context) => {
  const text = context.query.text ? context.query.text : null;
  return { props: { text } };
};
const AutoComplete = ({ word, onClick }: AutoCompleteProps) => {
  const autoCompleteMutation = useMutation(
    async (word: { text: string | undefined }) =>
      await axios
        .post<ApiWord[]>(
          process.env.NEXT_PUBLIC_API_LINK + "/translate/autocomplete",
          word
        )
        .then((data) => data.data)
  );
  useEffect(() => {
    autoCompleteMutation.mutate({ text: word });
  }, [word]);
  if (autoCompleteMutation.data?.length == 0) return null;
  if (autoCompleteMutation.isLoading)
    return (
      <div className="absolute bg-white rounded-lg divide-y left-0 right-0 top-20 w-full border border-black/50 ">
        {[...Array(10)].map((_, index) => (
          <div key={index} className="px-5 cursor-pointer py-2 w-full">
            <div className="h-6">
              <div className="w-16 h-2/3 rounded-full bg-neutral-300 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div className="absolute bg-white rounded-lg divide-y left-0 right-0 top-20 w-full border border-black/50">
      {autoCompleteMutation.data?.map((syn) => (
        <div
          key={syn.word}
          className="px-5 cursor-pointer py-2 w-full"
          onClick={(e) => {
            onClick(syn.word);
          }}
        >
          <div className="">
            <span>{syn.word}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Translate = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const input = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const likesQuery = useLikes();
  const likeMutation = useLikeMutaton();
  const delikeMutation = useUnLikeMutation();
  const audioMutation = useAudioMutation(0.3);
  const translateMutation = useMutation(
    (word: { text: string | undefined }) => {
      return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", word);
    }
  );

  const dictionaryMutation = useMutation(async (word: { text?: string }) => {
    return await axios
      .post<ApiWord[]>(
        process.env.NEXT_PUBLIC_API_LINK + "/translate/dictionary",
        word
      )
      .then((data) => data.data);
  });

  useEffect(() => {
    translateMutation.mutate({ text: searchTerm });
    dictionaryMutation.mutate({ text: searchTerm });
    router.push("?text=" + searchTerm);
  }, [debouncedSearch]);
  useEffect(() => {
    input.current?.focus();
    if (props.text) input.current!.value = props.text.toString();
  }, []);

  return (
    <>
      <Head>
        <title>Translate</title>
      </Head>
      <div className="flex flex-1 flex-col gap-5 items-center">
        <div className="w-full flex justify-center items-center">
          <div className="w-2/3 px-5 py-2 border bg-white text-black rounded-xl flex justify-center">
            <div className="w-1/2 relative">
              <div className=" h-32 flex border-r-2">
                <textarea
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  ref={input}
                  maxLength={500}
                  className="resize-none scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-neutral-700 scrollbar-track-rounded-md scrollbar-thumb-rounded-md text-xl bg-white w-full flex-1 h-full outline-none"
                ></textarea>
                <div className="flex-col flex gap-2 pr-3">
                  <FiVolume2
                    className="right-5 top-0 cursor-pointer stroke-gray-400 hover:stroke-gray-600"
                    size={35}
                    onClick={() => audioMutation.mutate({ text: searchTerm })}
                  />
                </div>
              </div>
              <AutoComplete
                word={debouncedSearch}
                onClick={(word) => {
                  setSearchTerm(word);
                }}
              />
            </div>
            <div className="w-1/2">
              <div className="w-full h-full flex outline-none bg-white ">
                <div className="flex-1">
                  <span className="break-all">
                    {translateMutation.data?.data.translations[0].text}
                  </span>
                </div>
                <div className="flex-col flex gap-2">
                  <FiHeart
                    onClick={() => {
                      likesQuery.data?.find((item) => item.eng == searchTerm)
                        ? delikeMutation.mutate({ eng: searchTerm })
                        : likeMutation.mutate({
                            eng: searchTerm,
                            rus: translateMutation.data?.data.translations[0]
                              .text,
                          });
                    }}
                    className={
                      likesQuery.data?.find((item) => item.eng == searchTerm)
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
              {dictionaryMutation.data?.map((item, index) => (
                <p
                  className="text-black cursor-pointer"
                  key={index}
                  onClick={() => {
                    setSearchTerm(item.word);
                  }}
                >
                  {item.word}
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
