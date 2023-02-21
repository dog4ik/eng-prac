import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useState } from "react";
import srtParser from "../utils/srtParser";
import { trpc } from "../utils/trpc";
import useClose from "../utils/useClose";
import { useLikeMutaton } from "../utils/useLikes";
import useToggle from "../utils/useToggle";
type Props = {
  time: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPaused: boolean;
  subSrc: string | null;
};
const TranslateModal = ({
  word,
  handleClose,
}: {
  word: string;
  handleClose: () => void;
}) => {
  const [open, setClose] = useClose(handleClose, 200);
  useEffect(() => {
    const timeout = setTimeout(() => setClose(), 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, [word]);

  return (
    <div
      className={`transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      } absolute -top-1/2 left-1/2 flex -translate-y-1/2 -translate-x-1/2 items-center justify-center rounded-full bg-neutral-600 py-1 px-4`}
    >
      <span>{word}</span>
    </div>
  );
};
const Subtitles = ({ time, videoRef, isPaused, subSrc }: Props) => {
  const [chunk, setChunk] = useState<string[]>();
  const [selectedWord, setSelectedWord] = useState<string>();
  const [isTranslateOpen, setIsTranslateOpen] = useToggle(false);
  const likeMutation = useLikeMutaton();
  const likes = trpc.words.getLikes.useQuery();
  const subsQuery = useQuery<
    {
      id: number;
      startTime: string | number;
      endTime: string | number;
      text: string;
    }[]
  >(
    ["subs", subSrc],
    () => axios.get(subSrc ?? "").then((data) => srtParser(data.data)),
    { enabled: subSrc != null }
  );
  const translateMutation = useMutation<
    AxiosResponse<{ translations: { text: string }[] }>,
    AxiosError,
    { text: string }
  >(["translate", selectedWord], (data) => axios.post("/api/translate", data));
  useEffect(() => {
    setChunk(
      subsQuery.data
        ?.find((c) => c.endTime > time && c.startTime < time)
        ?.text.split(/\n+/g)
    );
  }, [time, subsQuery.isSuccess]);
  useEffect(() => {
    return () => {
      !isPaused && videoRef.current?.play();
    };
  }, []);
  return (
    <div className="relative flex flex-col gap-2 bg-black/80">
      {isTranslateOpen && translateMutation.isSuccess && (
        <TranslateModal
          word={translateMutation.data?.data.translations[0].text ?? ""}
          handleClose={() => setIsTranslateOpen()}
        />
      )}
      {chunk?.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.split(" ").map((word, index) => (
            <span
              className={`cursor-pointer truncate rounded-md text-2xl hover:outline 2xl:text-4xl ${
                likes.data?.find(
                  (item) => item.eng == word.replace(/\W+\B/g, "").trim()
                ) && "bg-pink-500"
              }`}
              key={index}
              onClick={() => {
                setSelectedWord(word.replace(/\W+\B/g, "").trim());
                translateMutation.mutate({
                  text: word.replace(/\W+\B/g, "").trim(),
                });
                setIsTranslateOpen(true);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                likeMutation.mutate([
                  { eng: word.replace(/\W+\B/g, "").trim() },
                ]);
              }}
            >
              {word}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Subtitles;
