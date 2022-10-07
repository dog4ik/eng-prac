import React from "react";
import { FiPlus } from "react-icons/fi";
import Image from "next/image";
import { Book } from "../utils/useWordbook";
type Props = {
  data: Book;
  setEditModal?: (value?: boolean | undefined) => void;
  setAddModal?: (value?: boolean | undefined) => void;
  isOwner: boolean;
};
const WordbookHeader = ({
  setEditModal,
  setAddModal,
  data,
  isOwner,
}: Props) => {
  return (
    <>
      <div className="flex gap-5 relative">
        <div className="w-52 h-52 shrink-0 relative">
          <Image
            src=" https://www.placecage.com/c/300/300"
            alt="Wordbook cover"
            layout="fill"
            className={`aspect-square drop-shadow-2xl shadow-xl object-cover object-center ${
              isOwner && "cursor-pointer"
            }`}
            onClick={() => (isOwner ? setEditModal!() : null)}
          />
        </div>

        <div className="flex flex-col justify-between overflow-hidden py-2">
          <span className="uppercase text-xs">Wordbook</span>
          <h1
            className={`${
              data.name.length! > 35
                ? "text-xl md:text-2xl lg:text-3xl"
                : "text-2xl md:text-4xl lg:text-6xl"
            } font-semibold ${isOwner && "cursor-pointer"} w-full break-words`}
            onClick={() => (isOwner ? setEditModal!() : null)}
          >
            {data.name}
          </h1>
          {data.description ? <p>{data.description}</p> : null}
          <p>{data.words?.length + " words"}</p>
        </div>
        {isOwner && (
          <div
            className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-green-500 p-2"
            onClick={() => (isOwner ? setAddModal!() : null)}
          >
            <FiPlus size={40} />
          </div>
        )}
      </div>
      <div className="w-full h-16 flex px-2 sticky top-0 bg-neutral-800/95 z-10 border-b border-neutral-600">
        <div className="flex w-1/12 items-center">
          <p className="font-extrabold text-md">#</p>
        </div>
        <div className="flex w-4/12 items-center">
          <p className="font-extrabold text-md">Russian</p>
        </div>
        <div className="flex w-4/12 items-center">
          <p className="font-extrabold text-md">English</p>
        </div>
        <div className="flex w-2/12 items-center">
          <p className="font-extrabold text-md">Addded</p>
        </div>
        <div className="flex w-1/12 gap-5 justify-end items-center"></div>
      </div>
    </>
  );
};

export default WordbookHeader;
