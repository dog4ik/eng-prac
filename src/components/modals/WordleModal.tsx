import Link from "next/link";
import React from "react";
import { FiX } from "react-icons/fi";
import useClose from "../../utils/useClose";
type ModalProps = {
  handleClose: () => void;
  word: string;
  id?: string;
  isWin: boolean;
};

const WordleModal = ({ handleClose, isWin, word }: ModalProps) => {
  const [open, setOpen] = useClose(handleClose, 200);

  return (
    <div
      onClick={setOpen}
      className={`fixed top-0 left-0 h-screen w-screen backdrop-filter backdrop-blur-sm z-20 flex justify-center items-center duration-200 transition-opacity ${
        open ? "animate-fade-in" : "opacity-0"
      } `}
    >
      <div
        className=" py-5 max-w-lg w-full relative bg-neutral-900 rounded-2xl flex flex-col "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FiX
          className="absolute right-3 top-3 cursor-pointer"
          onClick={setOpen}
          size={35}
        />
        {isWin ? (
          <div className="flex flex-col items-center gap-10">
            <span className="text-2xl">You won!</span>
            <span className="text-xl">{`You guessed word: ${word}`}</span>
            <Link href={"/wordle"}>
              <button className="px-4 py-2 bg-green-500 rounded-full">
                Back to menu
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <span className="text-2xl">You Lose!</span>
            <span className="text-xl">{`Word was: ${word}`}</span>
            <Link href={"/wordle"}>
              <button className="px-4 py-2 bg-red-500 rounded-full">
                Back to menu
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordleModal;
