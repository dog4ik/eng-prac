import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import React, { useEffect, useRef, useState } from "react";
import useClose from "../utils/useClose";
import { useLikeMutaton, useLikes } from "../utils/useLikes";
import useToggle from "../utils/useToggle";
type Props = {
  time: number;
  videoRef: React.RefObject<HTMLVideoElement>;
  isPaused: boolean;
};
type SubsType = {
  id: number;
  startTime: number;
  endTime: number;
  text: string;
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
      } py-1 px-4 absolute -top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rounded-full bg-neutral-600 flex justify-center items-center`}
    >
      <span>{word}</span>
    </div>
  );
};
const Subtitles = ({ time, videoRef, isPaused }: Props) => {
  const [chunk, setChunk] = useState<string[]>();
  const [selectedWord, setSelectedWord] = useState<string>();
  const [isTranslateOpen, setIsTranslateOpen] = useToggle(false);
  const likeMutation = useLikeMutaton();
  const likes = useLikes();
  const subsQuery = useQuery<AxiosResponse<SubsType[]>, AxiosError>(
    ["subs"],
    () => axios.get("/api/theater/srt")
  );
  const translateMutation = useMutation<
    AxiosResponse<{ translations: { text: string }[] }>,
    AxiosError,
    { text: string }
  >(["translate", selectedWord], (data) => axios.post("api/translate", data));
  useEffect(() => {
    setChunk(
      subsQuery.data?.data
        .find((c) => c.endTime > time && c.startTime < time)
        ?.text.split(/\n+/g)
    );
  }, [time, subsQuery.isSuccess]);
  useEffect(() => {
    return () => {
      !isPaused && videoRef.current?.play();
    };
  }, []);
  return (
    <div
      onMouseOver={() => {
        videoRef.current?.pause();
      }}
      onMouseLeave={() => {
        !isPaused && videoRef.current?.play();
      }}
      className="flex flex-col gap-2 relative bg-black/80"
    >
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
              className={`text-2xl 2xl:text-4xl cursor-pointer truncate rounded-md hover:outline ${
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
