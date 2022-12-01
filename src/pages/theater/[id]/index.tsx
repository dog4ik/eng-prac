import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import TheaterHeader from "../../../components/TheaterHeader";
import Error from "../../../components/ui/Error";
import useGridCols from "../../../utils/useGrid";
type SeasonCardProps = {
  img?: string;
  title: string;
  episodes: number;
  href: string;
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
};
type SeasonsType = {
  id: string;
  number: number;
  releaseDate: string;
  plot?: string;
  poster?: string;
  tmdbId: number;
  showsId: string;
  episodesCount: number;
};
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
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
            src={
              img ??
              "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            }
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
const LoadingCard = () => {
  return (
    <div className="w-40 h-60 rounded-xl bg-neutral-400 animate-pulse"></div>
  );
};
const Seasons = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const seasonsQuery = useQuery(["get-seasons", props.id], () =>
    axios.get<{ parentShow: ShowType; seasons: SeasonsType[] }>(
      `/api/theater/${props.id}`
    )
  );
  const cols = useGridCols(270);
  if (seasonsQuery.isError) return <Error />;
  return (
    <div className="px-1 md:px-20 flex-col flex gap-10 py-4">
      {seasonsQuery.isSuccess && (
        <TheaterHeader
          description={seasonsQuery.data.data.parentShow.plot}
          img={seasonsQuery.data.data.parentShow.poster}
          title={seasonsQuery.data.data.parentShow.title}
          subtitle={seasonsQuery.data.data.parentShow.releaseDate}
          ratings={Number(seasonsQuery.data.data.parentShow.rating)}
        />
      )}
      <div
        className="w-full py-4 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
        style={cols}
      >
        {seasonsQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}
        {seasonsQuery.isSuccess &&
          seasonsQuery.data.data.seasons.map((season) => (
            <SeasonCard
              img={season.poster}
              title={`Season ${season.number}`}
              episodes={season.episodesCount}
              href={props.id + "/" + season.number.toString()}
            />
          ))}
      </div>
    </div>
  );
};

export default Seasons;
