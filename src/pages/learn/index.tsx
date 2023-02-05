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
const percentToDegs = (percentValue: number) => (percentValue * 360) / 100;
const generateColor = () =>
  "#" +
  Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
const Test = ({ name, wordsCount, liked, id, setId }: CardProps) => {
  const [degree, setDegree] = useState(145);
  return (
    <div className="relative flex h-60 w-60 flex-col overflow-hidden rounded-3xl bg-neutral-600">
      <div
        onClick={() => setId(id)}
        style={{
          background: `conic-gradient(rgb(34 197 94) ${degree}deg, #fff 0deg)`,
        }}
        className="absolute bottom-12 right-1 flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-lg duration-300 hover:scale-105 hover:shadow-xl"
      >
        <div className="flex h-5/6 w-5/6 items-center justify-center rounded-full bg-white">
          <FiPlay className="h-2/3 w-2/3 fill-neutral-100 stroke-neutral-600" />
        </div>
      </div>

      <div
        className="h-2/3 overflow-hidden p-3 "
        style={{
          backgroundColor: useMemo(() => generateColor(), []),
        }}
      >
        <p className="text-2xl font-semibold">{name}</p>
      </div>
      <div className="flex h-1/3 justify-around bg-white text-black">
        <div className="flex flex-col items-center justify-evenly">
          <p className="text-xl font-semibold">{wordsCount}</p>
          <p className="text-sm text-black/75 ">Words</p>
        </div>
        <div className="flex flex-col items-center justify-evenly">
          <p className="text-xl font-semibold">{liked}</p>
          <p className="text-sm text-black/75 ">Likes</p>
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
        <div className=" flex flex-1 flex-col">
          <div
            className="grid auto-rows-auto place-items-center items-center justify-center gap-5"
            style={cols}
          >
            <Test
              id="like"
              liked={likes.data.length}
              name="Liked"
              setId={() => null}
              wordsCount={likes.data.length}
            />
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
