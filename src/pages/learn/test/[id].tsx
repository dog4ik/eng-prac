import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useState } from "react";
import Title from "../../../components/Title";
import Error from "../../../components/ui/Error";
import Loading from "../../../components/ui/Loading";
import { useWordbook, Word } from "../../../utils/useWordbook";
type Props = {
  word: Word;
  isSelected: boolean;
  onClick: (word: Word) => void;
  isError: boolean;
};
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
};
const Option = ({ word, isSelected, isError, onClick }: Props) => {
  return (
    <div
      className="group cursor-pointer md:w-1/5 h-32 bg-neutral-600 rounded-lg relative flex items-center justify-center"
      onClick={() => onClick(word)}
    >
      <p className="text-2xl truncate">{word?.eng}</p>
      <div
        className={`absolute select-none top-2 right-2 flex items-center justify-center border-white border-2 rounded-full w-6 h-6 ${
          isSelected && !isError && "bg-green-400"
        } ${isError && "bg-red-400"}`}
      ></div>
      <div
        className={`w-1/2 group-hover:h-2/3 group-hover:w-2/3 duration-300 rounded-full blur-3xl absolute animate-blob ${
          isError ? "bg-red-500 h-full" : "bg-sky-500 h-1/4 "
        }`}
      />
    </div>
  );
};
const createQ = (words: Word[] | undefined) => {
  if (!words) return { options: [], answer: "" };
  const options: Word[] = [];
  for (let i = 0; i < 4; i++) {
    const index = Math.floor(Math.random() * words!.length);
    options.push(words![index]);
    words = words?.filter((item, i) => i != index);
  }
  const answer =
    options[Math.floor(Math.random() * options.length)]?.rus.toLowerCase();
  return { options, answer };
};
const Learning = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const wordQuery = useWordbook(props.id);
  let words = wordQuery.data?.words;
  const [selected, setSelected] = useState<Word>();
  const [options, setOptions] = useState<Word[]>([]);
  const [answer, setAnswer] = useState<string>();
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (wordQuery.data) {
      const q = createQ(words);
      setOptions(q.options);
      setAnswer(q.answer);
    }
  }, [wordQuery.data]);

  const handleAnswer = () => {
    if (selected?.rus.toLowerCase() === answer?.toLowerCase()) {
      const q = createQ(words);
      setOptions(q.options);
      setAnswer(q.answer);
      setSelected(undefined);
      setError(undefined);
    } else {
      setError(selected?.rus);
    }
  };
  if (wordQuery.isError) return <Error />;
  if (wordQuery.data === null) return <div>Logged out</div>;

  if (wordQuery.isLoading) return <Loading />;

  if (words && words.length < 4) return <div>need at least 4 words</div>;
  if (wordQuery.data)
    return (
      <>
        <Title title="Learn" />

        <div className="flex px-5 md:px-20 flex-col gap-5 flex-1 items-center">
          <div className="p-10">
            <span className="text-4xl" onClick={() => console.log(selected)}>
              {answer}
            </span>
          </div>
          <div className="w-full h-full md:flex grid grid-cols-2 items-center gap-5 justify-around">
            <Option
              key={0}
              isError={error == options[0]?.rus}
              word={options[0]}
              isSelected={selected?.eng == options[0]?.eng}
              onClick={(s: Word) => setSelected(s)}
            />
            <Option
              key={1}
              isError={error == options[1]?.rus}
              word={options[1]}
              isSelected={selected?.eng == options[1]?.eng}
              onClick={(s: Word) => setSelected(s)}
            />
            <Option
              key={2}
              isError={error == options[2]?.rus}
              word={options[2]}
              isSelected={selected?.eng == options[2]?.eng}
              onClick={(s: Word) => setSelected(s)}
            />
            <Option
              key={3}
              isError={error == options[3]?.rus}
              word={options[3]}
              isSelected={selected?.eng == options[3]?.eng}
              onClick={(s: Word) => setSelected(s)}
            />
          </div>
          <button
            className={`px-10 py-5 rounded-md  transition duration-200 ${
              error
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => handleAnswer()}
          >
            Submit
          </button>
        </div>
      </>
    );
};

export default Learning;
