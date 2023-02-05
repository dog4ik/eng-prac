import Link from "next/link";
import Image from "next/image";
import React from "react";
import TheaterHeader from "../../../../components/TheaterHeader";
import useGridCols from "../../../../utils/useGrid";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Error from "../../../../components/ui/Error";
import { trpc } from "../../../../utils/trpc";
import NotFoundError from "../../../../components/ui/NotFoundError";
import Title from "../../../../components/Title";
import formatDuration from "../../../../utils/formatDuration";
type EpisodeCardProps = {
  haveSubs: boolean;
  img: string | null;
  blurData: string | null;
  title: string;
  episode: number;
  href: string;
  duration: number;
};

export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
}> = async (context) => {
  const { id, season } = context.query;
  return { props: { id, season } };
};
const EpisodeCard = ({
  img,
  title,
  episode,
  href,
  blurData,
  haveSubs,
  duration,
}: EpisodeCardProps) => {
  return (
    <div>
      <Link
        href={href}
        className="max-xs relative flex aspect-video w-80 cursor-pointer items-end justify-center overflow-hidden rounded-xl bg-neutral-500 duration-200 hover:scale-105"
      >
        <Image
          draggable={false}
          fill
          sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
          className="object-cover"
          alt="Episode poster"
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        ></Image>
        <div className="absolute top-0 right-0 flex items-center p-1">
          <span
            className={`inline-block rounded-xl px-1 py-0.5 text-sm ${
              haveSubs ? "bg-green-500" : "bg-red-500"
            }`}
          >
            Subs
          </span>
        </div>
        <div className="absolute bottom-0 right-0 flex items-center p-1">
          <span className="rounded-md bg-black p-0.5 text-sm">
            {formatDuration(duration)}
          </span>
        </div>
      </Link>
      <div className="flex w-full flex-col gap-1 py-3">
        <div>
          <Link href={href}>
            <p className="max-w-xs truncate text-lg" title={title}>
              {title}
            </p>
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="cursor-pointer text-sm text-neutral-300 hover:underline"
          >
            {`Episode ${episode}`}
          </Link>
        </div>
      </div>
    </div>
  );
};
const LoadingCard = () => {
  return (
    <div className="h-40 w-80 animate-ping rounded-xl bg-neutral-400"></div>
  );
};
const Season = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const cols = useGridCols(440);
  const episodesQuery = trpc.theater.getEpisodes.useQuery({
    showId: props.id!.toString(),
    number: parseInt(props.season!.toString()),
  });
  if (episodesQuery.isError) {
    if (episodesQuery.error.data?.code === "NOT_FOUND")
      return <NotFoundError text="Season" />;
    return <Error />;
  }
  return (
    <>
      <Title
        title={
          episodesQuery.isSuccess
            ? `Season ${episodesQuery.data?.number}`
            : "Loading..."
        }
      />
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
        {episodesQuery.isSuccess && (
          <TheaterHeader
            description={episodesQuery.data.plot}
            blurData={episodesQuery.data.blurData}
            img={episodesQuery.data.poster}
            title={"Season " + episodesQuery.data.number}
            subtitle={`${episodesQuery.data.releaseDate}`}
          />
        )}
        <div
          className="grid w-full auto-rows-auto place-items-center items-center justify-center gap-5 py-4"
          style={cols}
        >
          {episodesQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}

          {episodesQuery.isSuccess &&
            episodesQuery.data.episodes.map((episode) => (
              <EpisodeCard
                haveSubs={episode.subSrc !== null}
                duration={episode.duration}
                key={episode.id}
                img={episode.poster}
                blurData={episode.blurData}
                title={episode.title}
                episode={episode.number}
                href={`/theater/${props.id}/${props.season}/${episode.number}`}
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Season;
