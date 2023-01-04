import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Title from "../../components/Title";
import Error from "../../components/ui/Error";
import useGridCols from "../../utils/useGrid";
type ShowCardProps = {
  img?: string;
  title: string;
  seasons: number;
  id: string;
};
type ShowType = {
  backdrop?: string;
  plot?: string;
  id: string;
  poster?: string;
  title: string;
  rating?: string;
  tmdbId: string;
  releaseDate: string;
  seasonsCount: number;
};

const ShowCard = ({ img, title, seasons, id }: ShowCardProps) => {
  return (
    <div>
      <Link
        href={`theater/${id}`}
        className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden rounded-xl bg-neutral-500 w-52 h-72 flex justify-center items-end"
      >
        <Image
          draggable={false}
          priority
          fill
          sizes="(max-width: 768px) 90vw,
              (max-width: 1200px) 33vw,
              10vw"
          className="object-cover"
          alt="Show poster"
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        ></Image>
      </Link>
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
            {`${seasons} season${seasons === 1 ? "" : "s"}`}
          </Link>
        </div>
      </div>
    </div>
  );
};
const LoadingCard = () => {
  return (
    <div className="w-52 h-72 rounded-xl bg-neutral-400 animate-pulse"></div>
  );
};
const Shows = () => {
  const cols = useGridCols(270);
  const showsQuery = useQuery(["all-shows"], () =>
    axios.get<ShowType[]>("/api/theater")
  );
  if (showsQuery.isError) {
    return <Error />;
  }
  return (
    <>
      <Title title="Shows" />
      <div
        className="w-full py-4 md:px-10 px-1 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
        style={cols}
      >
        {showsQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}
        {showsQuery.isSuccess &&
          showsQuery.data.data.map((show) => (
            <ShowCard
              id={show.id}
              img={show.poster}
              seasons={show.seasonsCount}
              title={show.title}
              key={show.id}
            />
          ))}
      </div>
    </>
  );
};

export default Shows;
