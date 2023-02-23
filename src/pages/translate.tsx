import { trpc } from "../utils/trpc";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FiBook, FiHeart, FiVolume2 } from "react-icons/fi";
import useDebounce from "../utils/useDebounce";
import { useLikeMutaton, useUnLikeMutation } from "../utils/useLikes";
import useToggle from "../utils/useToggle";
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
        className="absolute left-0 right-0 top-20 w-full divide-y rounded-lg border border-black/50 bg-white "
      >
        {[...Array(9)].map((_, index) => (
          <div
            key={index}
            className="flex w-full cursor-pointer items-center justify-between px-5 py-2"
          >
            <div className="h-6">
              <div className="h-2/3 w-16 animate-pulse rounded-full bg-neutral-300"></div>
            </div>
          </div>
        ))}
      </div>
    );
  return (
    <div
      ref={containerRef}
      className="absolute left-0 right-0 top-20 w-full divide-y rounded-lg border border-black/50 bg-white"
    >
      {autoCompleteMutation.data
        ?.filter((item) => item.word != word)
        .map((syn) => (
          <div
            key={syn.word}
            className="flex w-full cursor-pointer items-center justify-between px-5 py-2"
            onClick={() => {
              onClick(syn.word);
            }}
          >
            <div className="">
              <span>{syn.word}</span>
            </div>
            <div className="flex h-3 w-20 items-center gap-0.5">
              <div
                className={`h-full w-1/4 rounded-l-full ${
                  syn.score < 300
                    ? "bg-red-500"
                    : syn.score < 500
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div
                className={`h-full w-1/4 ${
                  syn.score < 300
                    ? "bg-neutral-300"
                    : syn.score < 500
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              ></div>
              <div
                className={`h-full w-1/4 rounded-r-full ${
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
  const likesQuery = trpc.words.getLikes.useQuery();
  const likeMutation = useLikeMutaton();
  const delikeMutation = useUnLikeMutation();
  const audioMutation = trpc.translate.textToSpeech.useMutation({
    async onSuccess(data) {
      const byteArray = data.buffer;
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
      <div className="mt-5 flex flex-1 flex-col items-center gap-5">
        <div className="flex w-full items-center justify-center">
          <div className="flex flex-col justify-center divide-y-2 rounded-xl border bg-white px-5 py-2 text-black md:w-2/3 md:flex-row md:divide-y-0 md:divide-x-2">
            <div className="relative md:w-1/2">
              <div className="flex md:h-32">
                <textarea
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsAutocompleteOpen(true);
                  }}
                  ref={input}
                  maxLength={500}
                  className="h-full w-full flex-1 resize-none bg-white text-xl outline-none scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-neutral-700 scrollbar-track-rounded-md scrollbar-thumb-rounded-md"
                ></textarea>
                <div className="flex flex-col gap-2 pr-3">
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
            <div className="md:w-1/2">
              <div className="flex h-full w-full bg-white outline-none ">
                <div className="flex-1">
                  <span className="break-all">
                    {translateMutation.data?.translations[0].text}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <FiHeart
                    onClick={() => {
                      likesQuery.data?.find((item) => item.eng == searchTerm)
                        ? delikeMutation.mutate([
                            {
                              eng: searchTerm,
                            },
                          ])
                        : likeMutation.mutate([
                            {
                              eng: searchTerm,
                              rus: translateMutation.data?.translations[0].text,
                            },
                          ]);
                    }}
                    className={
                      likesQuery.data?.find((item) => item.eng == searchTerm)
                        ? "cursor-pointer self-center fill-pink-500 stroke-pink-500 duration-100 hover:fill-pink-400 hover:stroke-pink-400"
                        : "cursor-pointer self-center stroke-gray-400 duration-100 hover:stroke-gray-600"
                    }
                    size={35}
                  ></FiHeart>
                  <FiBook
                    size={35}
                    className="cursor-pointer self-center stroke-gray-400 duration-100 hover:stroke-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex h-60 w-full flex-wrap overflow-y-auto rounded-xl bg-white md:w-2/3">
          {dictionaryMutation.isLoading ? (
            <p className="text-balack">Loading..</p>
          ) : (
            <div className="flex flex-col">
              {dictionaryMutation.data?.map((item, index) => (
                <p
                  className="cursor-pointer text-black"
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
