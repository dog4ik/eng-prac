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
        className="relative flex h-60 w-40 cursor-pointer items-end justify-center overflow-hidden rounded-xl bg-neutral-500 duration-200 hover:scale-105"
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
      <div className="flex w-full flex-col gap-1 py-3">
        <div>
          <Link href={href} className="cursor-pointer text-lg">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="cursor-pointer text-sm text-neutral-300 hover:underline"
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
    <div className="h-60 w-40 animate-pulse rounded-xl bg-neutral-400"></div>
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
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
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
          className="grid w-full auto-rows-auto place-items-center items-center justify-center gap-5 py-4"
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
