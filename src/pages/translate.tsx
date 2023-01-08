import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { FiX } from "react-icons/fi";
import { trpc } from "../utils/trpc";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import superjson from "superjson";
import React, { useEffect, useRef, useState } from "react";
import { FiBook, FiHeart, FiVolume2 } from "react-icons/fi";
import useAudioMutation from "../utils/useAudioMutation";
import useDebounce from "../utils/useDebounce";
import { useLikeMutaton, useLikes, useUnLikeMutation } from "../utils/useLikes";
import useToggle from "../utils/useToggle";
type ApiWord = {
  word: string;
  score: number;
};
type AutoCompleteProps = {
  word: string;
  onClick: (word: string) => void;
  handleClose: () => void;
};
export const getServerSideProps: GetServerSideProps<{
  text?: string | string[] | null;
}> = async (context) => {
  const text = context.query.text ? context.query.text : null;
  return { props: { text } };
};
const AutoComplete = ({ word, onClick, handleClose }: AutoCompleteProps) => {
  const autoCompleteMutation = trpc.translate.autocomplete.useMutation();
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    autoCompleteMutation.mutate({ text: word });
  }, [word]);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        handleClose();
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  if (autoCompleteMutation.data?.length == 0) return null;
  if (autoCompleteMutation.isLoading)
    return (
      <div
        ref={containerRef}
        className="absolute bg-white rounded-lg divide-y left-0 right-0 top-20 w-full border border-black/50 "
      >
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="px-5 flex justify-between items-center cursor-pointer py-2 w-full"
          >
            <div className="h-6">
              <div className="w-16 h-2/3 rounded-full bg-neutral-300 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div
      ref={containerRef}
      className="absolute bg-white rounded-lg divide-y left-0 right-0 top-20 w-full border border-black/50"
    >
      {autoCompleteMutation.data
        ?.filter((item) => item.word != word)
        .map((syn) => (
          <div
            key={syn.word}
            className="px-5 flex justify-between items-center cursor-pointer py-2 w-full"
            onClick={(e) => {
              onClick(syn.word);
            }}
          >
            <div className="">
              <span>{syn.word}</span>
            </div>
            <div className="flex gap-0.5 h-3 w-20 items-center">
              <div
                className={`w-1/4 h-full rounded-l-full ${
                  syn.score < 300
                    ? "bg-red-500"
                    : syn.score < 500
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div
                className={`w-1/4 h-full ${
                  syn.score < 300
                    ? "bg-neutral-300"
                    : syn.score < 500
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div
                className={`w-1/4 h-full rounded-r-full ${
                  syn.score < 500 ? "bg-neutral-300" : "bg-green-500"
                }`}
              ></div>
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
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useToggle(false);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const likesQuery = useLikes();
  const likeMutation = useLikeMutaton();
  const delikeMutation = useUnLikeMutation();
  const audioMutation = trpc.translate.textToSpeech.useMutation({
    async onSuccess(data) {
      const array = data as unknown as { type: string; data: number[] };
      const byteArray = Uint8Array.from(array.data).buffer;
      console.log(data);
      if (byteArray.byteLength == 0) return;
      const context = new AudioContext();
      const audioBuffer = await context.decodeAudioData(byteArray);
      const source = context.createBufferSource();
      const gainNode = context.createGain();
      gainNode.gain.value = 0.3;
      gainNode.connect(context.destination);
      source.buffer = audioBuffer;
      source.connect(gainNode);
      source.start();
    },
  });
  const translateMutation = trpc.translate.translate.useMutation();
  const dictionaryMutation = trpc.translate.dictionary.useMutation();
  useEffect(() => {
    translateMutation.mutate({ text: searchTerm });
    dictionaryMutation.mutate({ text: searchTerm });
    router.push("?text=" + searchTerm);
  }, [debouncedSearch]);
  useEffect(() => {
    input.current?.focus();
    if (props.text) {
      input.current!.value = props.text.toString();
      setSearchTerm(props.text.toString());
    }
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
                    setIsAutocompleteOpen(true);
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
              {isAutocompleteOpen && (
                <AutoComplete
                  word={debouncedSearch}
                  onClick={(word) => {
                    setSearchTerm(word);
                    setIsAutocompleteOpen(false);
                  }}
                  handleClose={() => setIsAutocompleteOpen(false)}
                />
              )}
            </div>
            <div className="w-1/2">
              <div className="w-full h-full flex outline-none bg-white ">
                <div className="flex-1">
                  <span className="break-all">
                    {translateMutation.data?.translations[0].text}
                  </span>
                </div>
                <div className="flex-col flex gap-2">
                  <FiHeart
                    onClick={() => {
                      likesQuery.data?.find((item) => item.eng == searchTerm)
                        ? delikeMutation.mutate({ eng: searchTerm })
                        : likeMutation.mutate({
                            eng: searchTerm,
                            rus: translateMutation.data?.translations[0].text,
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
