import React from "react";
import { FiPlus } from "react-icons/fi";
import Image from "next/image";
import { Book } from "../utils/useWordbook";
type Props = {
  data: { name: string; count?: number; description?: string; picture: string };
  setEditModal?: (value?: boolean | undefined) => void;
  setAddModal?: (value?: boolean | undefined) => void;
  isOwner: boolean;
  type: "Wordbook" | "Profile" | "Test";
};
const Header = ({ setEditModal, setAddModal, data, isOwner, type }: Props) => {
  return (
    <>
      <div className="relative flex gap-5">
        <div className="relative h-52 w-52 shrink-0">
          <Image
            src={data.picture}
            alt="cover"
            width={300}
            height={300}
            priority
            draggable={false}
            className={`aspect-square select-none object-cover object-center shadow-xl drop-shadow-2xl ${
              isOwner && "cursor-pointer"
            }`}
            onClick={() => (isOwner ? setEditModal!() : null)}
          />
        </div>

        <div className="flex flex-col justify-between overflow-hidden py-2">
          <span className="text-xs uppercase">{type}</span>
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
          <p>{data.count ?? 0} words</p>
        </div>
        {isOwner && type == "Wordbook" && (
          <div
            className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-green-500 p-2"
            onClick={() => (isOwner ? setAddModal!() : null)}
          >
            <FiPlus size={40} />
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
