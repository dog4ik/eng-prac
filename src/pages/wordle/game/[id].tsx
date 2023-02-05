import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useState } from "react";
import WordleModal from "../../../components/modals/WordleModal";
import Error from "../../../components/ui/Error";
import Loading from "../../../components/ui/Loading";
import NotFoundError from "../../../components/ui/NotFoundError";
import UnauthorizedError from "../../../components/ui/UnauthorizedError";
import { trpc } from "../../../utils/trpc";
import useToggle from "../../../utils/useToggle";
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
  tries,
  solution,
}: {
  onClick: (key: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  solution: string;
  tries: string[];
}) => {
  const keys = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];
  const createCharMap = () => {
    const charMap = new Map<string, "absent" | "correct" | "present">();
    tries.forEach((item) => {
      for (let i = 0; i < item.length; i++) {
        const char = item[i];
        if (char === solution[i]) {
          charMap.set(char, "correct");
          continue;
        }
        if (solution.includes(char)) {
          charMap.set(char, "present");
          continue;
        }
        charMap.set(char, "absent");
      }
    });
    return charMap;
  };
  const [charMap, setCharMap] = useState<
    Map<string, "absent" | "correct" | "present">
  >(createCharMap());
  useEffect(() => {
    setCharMap(createCharMap());
    console.log("fire", tries);
  }, [tries]);
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {keys.map((row, index) => (
        <div key={index} className="flex gap-2">
          {index == 2 && (
            <div
              onClick={() => {
                onDelete();
              }}
              className="flex cursor-pointer select-none items-center justify-center rounded-lg bg-white py-2 px-4 text-black"
            >
              <span className="text-xl uppercase">del</span>
            </div>
          )}
          {row.map((key) => {
            const evaluation = charMap.get(key);
            return (
              <div
                key={key}
                onClick={() => {
                  onClick(key);
                }}
                className={` ${
                  evaluation === "correct"
                    ? "bg-green-400"
                    : evaluation === "absent"
                    ? "bg-gray-400"
                    : evaluation === "present"
                    ? "bg-yellow-400"
                    : "bg-white"
                } flex cursor-pointer select-none items-center justify-center rounded-lg py-2 px-4 text-black`}
              >
                <span className="text-xl uppercase">{key}</span>
              </div>
            );
          })}

          {index == 2 && (
            <div
              onClick={() => {
                onEnter();
              }}
              className="flex cursor-pointer select-none items-center justify-center rounded-lg bg-white py-2 px-4 text-black"
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
      className={`flex h-20 w-20 items-center justify-center rounded-xl ${
        evaluation === "correct" && "bg-green-400"
      } ${evaluation === "present" && "bg-yellow-400"} ${
        evaluation === "absent" && "bg-gray-500"
      } ${evaluation === null && "bg-gray-700"}
      `}
    >
      {letter && <span className="text-3xl">{letter.toUpperCase()}</span>}
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
    <div className={`mb-5 flex w-full gap-5 rounded-full py-2 px-10`}>
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
  const [answer, setAnswer] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [currentRow, setCurrentRow] = useState<number>(0);
  const [tries, setTries] = useState<string[]>([]);
  const [wordleModal, setWordleModal] = useToggle(false);
  const wordleQuery = trpc.wordle.getGame.useQuery(
    { id: props.id!.toString() },
    {
      retry: false,
      onSuccess(data) {
        setCurrentRow(data.tries.length);
        setTries(data.tries);
        if (
          data.tries.includes(data.word) ||
          data.tries.length >= data.maxTries
        ) {
          setIsFinished(true);
        }
      },
    }
  );
  const submitMutation = trpc.wordle.submitAnswer.useMutation();
  const submitAnswer = () => {
    if (isFinished || wordleQuery.data?.word.length !== answer.length) return;
    submitMutation.mutate({ word: answer, id: props.id!.toString() });
    setCurrentRow((prev) => prev + 1);
    setTries([...tries, answer]);
    setAnswer("");
    if (
      wordleQuery.data.word === answer ||
      tries.length + 1 === wordleQuery.data.maxTries
    ) {
      setIsFinished(true);
      setWordleModal(true);
    }
  };

  const addToAnswer = (char: string) => {
    if (answer.length >= wordleQuery.data!.word.length || isFinished) return;
    setAnswer(answer + char);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!wordleQuery.isSuccess) return;
      if (
        e.key.toLocaleLowerCase().charCodeAt(0) >= 97 &&
        e.key.toLowerCase().charCodeAt(0) <= 122 &&
        e.key.length === 1
      )
        addToAnswer(e.key.toLocaleLowerCase());
      if (e.code === "Backspace") setAnswer((prev) => prev.slice(0, -1));
      if (e.code === "Enter") submitAnswer();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [answer, isFinished, wordleQuery.data?.tries]);

  if (wordleQuery.isFetching || wordleQuery.isLoading) return <Loading />;
  if (wordleQuery.isError) {
    if (wordleQuery.error.data?.code === "NOT_FOUND")
      return <NotFoundError text="Wordle" />;
    if (wordleQuery.error.data?.code === "UNAUTHORIZED")
      return <UnauthorizedError />;
    return <Error />;
  }
  return (
    <>
      {isFinished && wordleModal && (
        <WordleModal
          handleClose={() => setWordleModal(false)}
          isWin={tries.includes(wordleQuery.data.word)}
          word={wordleQuery.data.word}
        />
      )}

      <div className="flex flex-1 flex-col items-center justify-center">
        <div>
          {[...Array(wordleQuery.data.maxTries)].map((_, index) => (
            <Row
              key={index}
              maxLetters={wordleQuery.data.word.length}
              word={currentRow == index ? answer : tries[index]}
              evaluation={tries[index]
                ?.split("")
                .map((letter, index) =>
                  letter === wordleQuery.data.word[index]
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
          onDelete={() => setAnswer((prev) => prev.slice(0, -1))}
          onEnter={() => !submitMutation.isLoading && submitAnswer()}
          tries={tries}
          solution={wordleQuery.data.word}
        />
      </div>
    </>
  );
};

export default Wordle;
