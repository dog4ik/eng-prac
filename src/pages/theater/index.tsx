import Image from "next/image";
import Link from "next/link";
import React from "react";
import useGridCols from "../../utils/useGrid";
type ShowCardProps = {
  img: string;
  title: string;
  seasons: number;
  id: string;
};

const ShowCard = ({ img, title, seasons, id }: ShowCardProps) => {
  return (
    <div>
      <div className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden rounded-xl bg-neutral-500 w-52 h-72 flex justify-center items-end">
        <Link href={`theater/${id}`}>
          <Image
            draggable={false}
            fill
            className="object-cover"
            alt="cover"
            src={img}
          ></Image>
        </Link>
      </div>
      <div className="py-3 flex flex-col gap-1 w-full">
        <div>
          <Link href={`theater/${id}`} className="text-lg cursor-pointer">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={`theater/${id}`}
            className="text-sm text-neutral-300 hover:underline cursor-pointer"
          >
            {`${seasons} seasons`}
          </Link>
        </div>
      </div>
    </div>
  );
};
const Shows = () => {
  const cols = useGridCols(270);
  return (
    <div
      className="w-full py-4 md:px-10 px-1 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
      style={cols}
    >
      <ShowCard
        img="https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
        title="Friends"
        seasons={10}
        id={"ASda"}
      />
    </div>
  );
};

export default Shows;
