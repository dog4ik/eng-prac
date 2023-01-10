import Link from "next/link";
import Image from "next/image";
import React from "react";
import TheaterHeader from "../../../../components/TheaterHeader";
import useGridCols from "../../../../utils/useGrid";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Error from "../../../../components/ui/Error";
import { trpc } from "../../../../utils/trpc";
import NotFoundError from "../../../../components/ui/NotFoundError";
type EpisodeCardProps = {
  img: string | null;
  title: string;
  episode: number;
  href: string;
};

export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
}> = async (context) => {
  const { id, season } = context.query;
  return { props: { id, season } };
};
const EpisodeCard = ({ img, title, episode, href }: EpisodeCardProps) => {
  return (
    <div>
      <Link
        href={href}
        className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden aspect-video rounded-xl bg-neutral-500 w-80 max-xs flex justify-center items-end"
      >
        <Image
          draggable={false}
          fill
          sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
          className="object-cover"
          alt="Episode poster"
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        ></Image>
      </Link>
      <div className="py-3 flex flex-col gap-1 w-full">
        <div>
          <Link href={href}>
            <p className="truncate max-w-xs text-lg" title={title}>
              {title}
            </p>
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="text-sm text-neutral-300 hover:underline cursor-pointer"
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
    <div className="w-80 h-40 rounded-xl bg-neutral-400 animate-ping"></div>
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
    <div className="px-1 md:px-20 flex-col flex gap-10 py-4">
      {episodesQuery.isSuccess && (
        <TheaterHeader
          description={episodesQuery.data.plot}
          img={episodesQuery.data.poster}
          title={"Season " + episodesQuery.data.number}
          subtitle={`${episodesQuery.data.releaseDate}`}
        />
      )}
      <div
        className="w-full py-4 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
        style={cols}
      >
        {episodesQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}

        {episodesQuery.isSuccess &&
          episodesQuery.data.episodes.map((episode) => (
            <EpisodeCard
              key={episode.id}
              img={episode.poster}
              title={episode.title}
              episode={episode.number}
              href={`/theater/${props.id}/${props.season}/${episode.number}`}
            />
          ))}
      </div>
    </div>
  );
};

export default Season;
