import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import TheaterHeader from "../../../components/TheaterHeader";
import Title from "../../../components/Title";
import Error from "../../../components/ui/Error";
import NotFoundError from "../../../components/ui/NotFoundError";
import { trpc } from "../../../utils/trpc";
import useGridCols from "../../../utils/useGrid";
type SeasonCardProps = {
  img: string | null;
  blurData: string | null;
  title: string;
  episodes: number;
  href: string;
};
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
};
const SeasonCard = ({
  img,
  title,
  episodes,
  href,
  blurData,
}: SeasonCardProps) => {
  return (
    <div>
      <Link
        href={href}
        className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden rounded-xl bg-neutral-500 w-40 h-60 flex justify-center items-end"
      >
        <Image
          draggable={false}
          fill
          sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
          className="object-cover"
          alt="Season poster"
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        ></Image>
      </Link>
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
  const seasonsQuery = trpc.theater.getSeasons.useQuery({
    showId: props.id!.toString(),
  });
  const cols = useGridCols(270);
  if (seasonsQuery.isError) {
    if (seasonsQuery.error.data?.code === "NOT_FOUND")
      return <NotFoundError text="Show" />;
    return <Error />;
  }
  return (
    <>
      <Title title={seasonsQuery.data?.title ?? "Loading..."} />
      <div className="px-1 md:px-20 flex-col flex gap-10 py-4">
        {seasonsQuery.isSuccess && (
          <TheaterHeader
            description={seasonsQuery.data.plot}
            blurData={seasonsQuery.data.blurData}
            img={seasonsQuery.data.poster}
            title={seasonsQuery.data.title}
            subtitle={seasonsQuery.data.releaseDate}
            ratings={Number(seasonsQuery.data.rating)}
          />
        )}
        <div
          className="w-full py-4 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
          style={cols}
        >
          {seasonsQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}
          {seasonsQuery.isSuccess &&
            seasonsQuery.data.seasons.map((season) => (
              <SeasonCard
                key={season.id}
                img={season.poster}
                blurData={season.blurData}
                title={`Season ${season.number}`}
                episodes={season.episodesCount}
                href={props.id + "/" + season.number.toString()}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Seasons;
