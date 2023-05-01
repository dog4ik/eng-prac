import { useQuery } from "@tanstack/react-query";
import axios from "axios";
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
    <div className="absolute top-0 left-1/2 -translate-x-1/2 cursor-auto">
      <div
        className={`transition-transform duration-200 ${
          open ? "animate-slide-from-top" : "-translate-y-full"
        }  flex items-center justify-center rounded-b-xl bg-black py-4 px-32`}
      >
        <span className="text-2xl">{word}</span>
      </div>
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
      startTime: number;
      endTime: number;
      text: string;
    }[]
  >(
    ["subs", subSrc],
    () => axios.get(subSrc ?? "").then((data) => srtParser(data.data)),
    { enabled: subSrc != null }
  );
  const translateMutation = trpc.translate.translate.useMutation();
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
    <>
      {isTranslateOpen && translateMutation.isSuccess && (
        <TranslateModal
          word={translateMutation.data.translations[0].text ?? ""}
          handleClose={() => setIsTranslateOpen()}
        />
      )}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 cursor-auto flex-col items-center justify-center gap-2 bg-black/80">
        {chunk?.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.split(" ").map((word, index) => {
              const isLiked = !!likes.data?.find(
                (item) =>
                  item.eng.toLowerCase() ==
                  word.replace(/\W+\B/g, "").trim().toLowerCase()
              );
              return (
                <span
                  className={`cursor-pointer truncate rounded-md text-2xl hover:outline 2xl:text-4xl ${
                    isLiked ? "bg-pink-500" : ""
                  }`}
                  key={index}
                  onClick={() => {
                    setSelectedWord(word);
                    if (selectedWord != word)
                      translateMutation.mutate({
                        text: word.replace(/\W+\B/g, "").trim(),
                      });
                    setIsTranslateOpen(true);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isLiked)
                      likeMutation.mutate([
                        { eng: word.replace(/\W+\B/g, "").trim() },
                      ]);
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
};

export default Subtitles;
