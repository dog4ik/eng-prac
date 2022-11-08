import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useRef, useState } from "react";
import WordleModal from "../../../components/modals/WordleModal";
import Loading from "../../../components/ui/Loading";
import authApi from "../../../utils/authApi";
import useToggle from "../../../utils/useToggle";
type WordleType = {
  word: string;
  tries: string[];
  maxTries: number;
  id: string;
  userId: string;
  finishDate: Date;
};
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
};
const Keyboard = ({
  onClick,
  onEnter,
  onDelete,
}: {
  onClick: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
}) => {
  const keys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  return (
    <div className="flex flex-col justify-center items-center gap-2">
      {keys.map((row, index) => (
        <div key={index} className="flex gap-2">
          {index == 2 && (
            <div
              onClick={() => {
                onDelete();
              }}
              className="flex justify-center select-none items-center rounded-lg bg-white text-black py-2 px-4 cursor-pointer"
            >
              <span className="text-xl uppercase">del</span>
            </div>
          )}
          {row.map((key) => (
            <div
              key={key}
              onClick={() => {
                onClick(key);
              }}
              className="flex justify-center select-none items-center rounded-lg bg-white text-black py-2 px-4 cursor-pointer"
            >
              <span className="text-xl uppercase">{key}</span>
            </div>
          ))}
          {index == 2 && (
            <div
              onClick={() => {
                onEnter();
              }}
              className="flex justify-center select-none items-center rounded-lg bg-white text-black py-2 px-4 cursor-pointer"
            >
              <span className="text-xl uppercase">enter</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const Letter = ({
  letter,
  evaluation,
}: {
  letter?: string;
  evaluation: "absent" | "present" | "correct" | null;
}) => {
  return (
    <div
      className={`w-20 h-20 rounded-xl flex justify-center items-center ${
        evaluation === "correct" && "bg-green-400"
      } ${evaluation === "present" && "bg-yellow-400"} ${
        evaluation === "absent" && "bg-gray-500"
      } ${evaluation === null && "bg-gray-700"}
      `}
    >
      {letter && <span className="text-3xl">{letter}</span>}
    </div>
  );
};
const Row = ({
  word,
  maxLetters,
  evaluation,
}: {
  word?: string;
  maxLetters: number;
  evaluation: ("absent" | "present" | "correct")[] | null;
}) => {
  return (
    <div className={`w-full flex gap-5 mb-5 rounded-full py-2 px-10`}>
      {[...Array(maxLetters)].map((_, index) => (
        <Letter
          key={index}
          evaluation={evaluation ? evaluation[index] : null}
          letter={word ? word[index] : ""}
        />
      ))}
    </div>
  );
};
const Wordle = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const queryClient = useQueryClient();
  const [answer, setAnswer] = useState("");
  const [wordleModal, setWordleModal] = useToggle(false);
  const wordleQuery = useQuery<WordleType, AxiosError>(
    ["wordle", props.id],
    () => authApi.get("wordle/" + props.id).then((data) => data.data),
    { retry: false }
  );
  const submitMutation = useMutation(
    (word: { word: string }) => authApi.post("wordle/" + props.id, word),
    {
      onSuccess(data, variables, context) {
        setAnswer("");
        queryClient.invalidateQueries(["wordle", props.id]);
      },
    }
  );
  const submitAnswer = () => {
    if (
      answer.length !== wordleQuery.data?.word.length ||
      wordleQuery.data?.tries.length === wordleQuery.data?.maxTries
    )
      return;
    submitMutation.mutate({ word: answer });
    (wordleQuery.data.word === answer ||
      wordleQuery.data.tries.length + 1 == wordleQuery.data.maxTries) &&
      setWordleModal(true);
  };

  const addToAnswer = (str: string) => {
    if (wordleQuery.data) {
      if (wordleQuery.data.tries.includes(wordleQuery.data.word)) return;
      wordleQuery.data.word !== str &&
        wordleQuery.data.tries.length <= wordleQuery.data.maxTries &&
        setAnswer((prev) =>
          prev.length < wordleQuery.data.word.length ? prev + str : prev
        );
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLocaleLowerCase().charCodeAt(0) >= 97 &&
        e.key.toLowerCase().charCodeAt(0) <= 122 &&
        e.key.length === 1
      )
        addToAnswer(e.key.toLocaleLowerCase());
      if (e.code === "Backspace")
        setAnswer((prev) => prev.slice(length, length - 1));
      if (e.code === "Enter") submitAnswer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [answer, wordleQuery.isSuccess, wordleQuery.data?.tries]);
  if (wordleQuery.isLoading) return <Loading />;
  if (wordleQuery.isSuccess)
    return (
      <>
        {(wordleQuery.data.tries.includes(wordleQuery.data.word) ||
          wordleQuery.data.tries.length == wordleQuery.data.maxTries) &&
          wordleModal && (
            <WordleModal
              handleClose={() => setWordleModal(false)}
              isWin={wordleQuery.data.tries.includes(wordleQuery.data.word)}
              word={wordleQuery.data.word}
            />
          )}
        <div className="flex flex-col flex-1 justify-center items-center">
          <div>
            {[...Array(wordleQuery.data.maxTries)].map((_, index) => (
              <Row
                key={index}
                maxLetters={wordleQuery.data.word.length}
                word={
                  wordleQuery.data.tries.length == index
                    ? answer
                    : wordleQuery.data.tries[index] ?? ""
                }
                evaluation={wordleQuery.data.tries[index]
                  ?.split("")
                  .map((letter, index) =>
                    letter == wordleQuery.data.word[index]
                      ? "correct"
                      : wordleQuery.data.word.includes(letter)
                      ? "present"
                      : "absent"
                  )}
              />
            ))}
          </div>
          <Keyboard
            onClick={(key) => addToAnswer(key)}
            onDelete={() => setAnswer((prev) => prev.slice(length, length - 1))}
            onEnter={() => submitAnswer()}
          />
        </div>
      </>
    );
};

export default Wordle;
