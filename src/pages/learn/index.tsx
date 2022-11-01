import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiPlay, FiPlayCircle, FiX } from "react-icons/fi";
import TestModal from "../../components/modals/TestModal";
import Title from "../../components/Title";
import Loading from "../../components/ui/Loading";
import { useAllWordbooks } from "../../utils/useAllWordbooks";
import useGridCols from "../../utils/useGrid";
import { useLikes } from "../../utils/useLikes";
import useToggle from "../../utils/useToggle";
import { useWordbook } from "../../utils/useWordbook";
type CardProps = {
  name: string;
  wordsCount: number;
  liked: number;
  id: string;
  setId: (id: string) => void;
};

const generateColor = () =>
  "#" +
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
const Test = ({ name, wordsCount, liked, id, setId }: CardProps) => {
  return (
    <div className="w-60 h-60 overflow-hidden flex flex-col bg-neutral-600 rounded-3xl relative">
      <div
        onClick={() => setId(id)}
        className="absolute bottom-12 right-1 rounded-full cursor-pointer bg-white border-neutral-400 border-4 h-16 w-16 overflow-hidden shadow-lg hover:scale-105 hover:shadow-xl duration-300 justify-center items-center flex"
      >
        <FiPlay className="w-2/3 h-2/3 fill-neutral-100 stroke-neutral-600" />
      </div>

      <div
        className="p-3 h-2/3 overflow-hidden "
        style={{
          backgroundColor: useMemo(() => generateColor(), []),
        }}
      >
        <p className="text-2xl font-semibold">{name}</p>
      </div>
      <div className="h-1/3 bg-white flex justify-around text-black">
        <div className="flex flex-col justify-evenly items-center">
          <p className="text-xl font-semibold">{wordsCount}</p>
          <p className="text-black/75 text-sm ">Words</p>
        </div>
        <div className="flex flex-col justify-evenly items-center">
          <p className="text-xl font-semibold">{liked}</p>
          <p className="text-black/75 text-sm ">Likes</p>
        </div>
        <div className="flex flex-col justify-between"></div>
      </div>
    </div>
  );
};

const Learning = () => {
  const wordbooks = useAllWordbooks();
  const likes = useLikes();
  const ITEM_WIDTH = 260;
  const cols = useGridCols(ITEM_WIDTH);
  const [modalId, setModalId] = useState<string>();
  const [testModal, setTestModal] = useToggle(false);

  if (wordbooks.isLoading || likes.isLoading) return <Loading />;
  if (wordbooks.data && likes.data)
    return (
      <>
        <Title title="Learn" />
        {testModal && <TestModal id={modalId!} handleClose={setTestModal} />}
        <div className=" flex-1 flex flex-col">
          <div
            className="grid gap-5 place-items-center justify-center items-center auto-rows-auto"
            style={cols}
          >
            {wordbooks.data?.map((wordbook) => (
              <Test
                key={wordbook.id}
                setId={(id) => {
                  setModalId(id);
                  setTestModal(true);
                }}
                id={wordbook.id}
                name={wordbook.name}
                wordsCount={wordbook.words.length}
                liked={wordbook.words?.reduce((sum, word) => {
                  if (
                    likes.data!.findIndex((item) => {
                      return item.eng == word.eng;
                    }) != -1
                  )
                    sum = sum + 1;
                  return sum;
                }, 0)}
              />
            ))}
          </div>
        </div>
      </>
    );
};

export default Learning;
