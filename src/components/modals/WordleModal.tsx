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
      className={`fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm backdrop-filter transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      } `}
    >
      <div
        className=" relative flex w-full max-w-lg flex-col rounded-2xl bg-neutral-900 py-5 "
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
              <button className="rounded-full bg-green-500 px-4 py-2">
                Back to menu
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10">
            <span className="text-2xl">You Lose!</span>
            <span className="text-xl">{`Word was: ${word}`}</span>
            <Link href={"/wordle"}>
              <button className="rounded-full bg-red-500 px-4 py-2">
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
