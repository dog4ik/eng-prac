import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useState } from "react";
import Error from "../../../../components/ui/Error";
import Loading from "../../../../components/ui/Loading";
import Video from "../../../../components/Video";
import SrtModal from "../../../../components/modals/SrtModal";
import useToggle from "../../../../utils/useToggle";

type EpisodeType = {
  id: string;
  tmdbId: number;
  title: string;
  number: number;
  src: string;
  subSrc: string | null;
  externalSubs?: string[];
  releaseDate: string;
  rating?: string;
  poster?: string;
  plot?: string;
  showId: string;
  seasonNumber: number;
  siblings: {
    poster?: string;
    subSrc: string | null;
    title: string;
    number: number;
    id: string;
  }[];
};

export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
  episode?: string | string[];
}> = async (context) => {
  const { id, season, episode } = context.query;
  return { props: { id, season, episode } };
};

const SideBarEpisodes = ({
  episode,
  href,
  isCurrent,
}: {
  episode: {
    poster?: string;
    title: string;
    number: number;
  };
  href: any;
  isCurrent: boolean;
}) => {
  return (
    <Link
      href={{ query: href }}
      className={`grid grid-rows-1 grid-cols-2 cursor-pointer overflow-hidden gap-2 items-center shrink-0 h-24 w-full rounded-lg ${
        isCurrent ? "bg-white text-black" : "bg-neutral-600 text-white"
      }`}
    >
      <div className="w-full h-full">
        <Image
          src={episode.poster ?? "PLACEHOLDER"}
          width={230}
          height={128}
          alt={"Episode Poster"}
        />
      </div>
      <div className="flex flex-col justify-center items-center gap-5">
        <span className="text-md">{episode.title}</span>
        <span className="text-sm truncate">{`Episode ${episode.number}`}</span>
      </div>
    </Link>
  );
};

const Theater = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [isSrtModalOpen, setIsSrtModalOpen] = useToggle(false);
  const [customSrt, setCustomSrt] = useState<string>();
  const episodeQuery = useQuery(
    ["get-episode", props.season, props.id, props.episode],
    () =>
      axios.get<EpisodeType>(
        `/api/theater/${props.id}/${props.season}/${props.episode}`
      )
  );
  if (episodeQuery.isError) return <Error />;
  if (episodeQuery.isLoading) return <Loading />;
  return (
    <>
      {isSrtModalOpen && (
        <SrtModal
          handleClose={() => setIsSrtModalOpen(false)}
          tmdbId={episodeQuery.data.data.tmdbId}
          onChoose={(link) => setCustomSrt(link)}
        />
      )}
      <div className="flex flex-col p-4 xl:flex-row justify-between w-full gap-3">
        <div className="flex xl:w-3/4 flex-col gap-2">
          <div className="">
            <Video
              title={episodeQuery.data.data.title}
              src={
                process.env.NEXT_PUBLIC_MEDIA_SERVER_LINK +
                episodeQuery.data.data.src
              }
              subSrc={
                customSrt ??
                (episodeQuery.data.data.subSrc === null
                  ? null
                  : process.env.NEXT_PUBLIC_MEDIA_SERVER_LINK +
                    episodeQuery.data.data.subSrc)
              }
            />
          </div>
          <div className="flex flex-col">
            <div>
              <span className="text-xl font-semibold cursor-pointer">
                {episodeQuery.data.data.title}
              </span>
            </div>
            <div>
              <span className="text-sm cursor-pointer hover:underline">
                {`Season ${episodeQuery.data.data.seasonNumber}`}
              </span>
            </div>
            {episodeQuery.data.data.plot && (
              <div className="w-full p-2 mt-4 min-h-20 bg-neutral-700 rounded-lg">
                <p className="break-words">{episodeQuery.data.data.plot}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                className="px-5 text-black py-2 bg-white rounded-lg"
                onClick={() => setIsSrtModalOpen()}
              >
                Download subs
              </button>
              {customSrt && (
                <span
                  className="py-1 px-2 hover:bg-red-500 rounded-lg duration-200 transition-colors cursor-pointer"
                  onClick={() => setCustomSrt(undefined)}
                >
                  {customSrt?.split("/")[customSrt.split("/").length - 1]}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="">
          <div className="h-[800px] flex flex-col gap-5 xl:overflow-y-auto xl:mr-10">
            {episodeQuery.data.data.siblings.map((episode) => (
              <SideBarEpisodes
                episode={{
                  number: episode.number,
                  title: episode.title,
                  poster: episode.poster,
                }}
                href={{
                  id: episodeQuery.data.data.showId,
                  season: episodeQuery.data.data.seasonNumber,
                  episode: episode.number,
                }}
                isCurrent={episode.id === episodeQuery.data.data.id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Theater;
