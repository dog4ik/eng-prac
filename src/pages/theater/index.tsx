import Image from "next/image";
import Link from "next/link";
import React from "react";
import Title from "../../components/Title";
import Error from "../../components/ui/Error";
import NotFoundError from "../../components/ui/NotFoundError";
import { trpc } from "../../utils/trpc";
import useGridCols from "../../utils/useGrid";
type ShowCardProps = {
  img: string | null;
  blurData: string | null;
  title: string;
  seasons: number;
  id: string;
};

const ShowCard = ({ img, title, seasons, id, blurData }: ShowCardProps) => {
  return (
    <div>
      <Link
        href={`theater/${id}`}
        className="relative flex h-72 w-52 cursor-pointer items-end justify-center overflow-hidden rounded-xl bg-neutral-500 duration-200 hover:scale-105"
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
          <Link href={`theater/${id}`} className="cursor-pointer text-lg">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={`theater/${id}`}
            className="cursor-pointer text-sm text-neutral-300 hover:underline"
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
    <div className="h-72 w-52 animate-pulse rounded-xl bg-neutral-400"></div>
  );
};
const Shows = () => {
  const cols = useGridCols(270);
  const showsQuery = trpc.theater.getShows.useQuery();
  if (showsQuery.isError) {
    if (showsQuery.error.data?.code == "NOT_FOUND")
      return <NotFoundError text="Shows" />;
    return <Error />;
  }
  return (
    <>
      <Title title="Shows" />
      <div
        className="grid w-full auto-rows-auto place-items-center items-center justify-center gap-5 py-4 px-1 md:px-10"
        style={cols}
      >
        {showsQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}
        {showsQuery.isSuccess &&
          showsQuery.data.map((show) => (
            <ShowCard
              id={show.id}
              img={show.poster}
              blurData={show.blurData}
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
