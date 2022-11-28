import Image from "next/image";
import Link from "next/link";
import React from "react";
import TheaterHeader from "../../../components/TheaterHeader";
import useGridCols from "../../../utils/useGrid";
type SeasonCardProps = {
  img: string;
  title: string;
  episodes: number;
  href: string;
};
const SeasonCard = ({ img, title, episodes, href }: SeasonCardProps) => {
  return (
    <div>
      <div className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden rounded-xl bg-neutral-500 w-40 h-60 flex justify-center items-end">
        <Link href={href}>
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
          <Link href={href} className="text-lg cursor-pointer">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="text-sm text-neutral-300 hover:underline cursor-pointer"
          >
            {`${episodes} episodes`}
          </Link>
        </div>
      </div>
    </div>
  );
};
const Seasons = () => {
  const cols = useGridCols(270);
  return (
    <div className="px-1 md:px-20 flex-col flex gap-10 py-4">
      <TheaterHeader
        description=" Главные герои – шестеро друзей – Рейчел, Моника, Фиби, Джоуи, Чендлер
          и Росс. Три девушки и три парня, которые дружат, живут по соседству,
          вместе убивают время и противостоят жестокой реальности, делятся
          своими секретами и иногда очень сильно влюбляются."
        img={
          "https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
        }
        title="friends"
        subtitle={"1972"}
        ratings={2.5}
      />
      <div
        className="w-full py-4 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
        style={cols}
      >
        <SeasonCard
          img="https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
          title="Season 1"
          episodes={25}
          href={"sad/sd"}
        />
      </div>
    </div>
  );
};

export default Seasons;
