import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect } from "react";
import Error from "../../../../components/ui/Error";
import Loading from "../../../../components/ui/Loading";
import Video from "../../../../components/Video";
type EpisodeType = {
  id: string;
  title: string;
  number: number;
  src: string;
  externalSubs?: string[];
  releaseDate: string;
  rating?: string;
  poster?: string;
  plot?: string;
  seasonId: string;
  tmdbId: number;
  scannedDate: string;
};
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
  episode?: string | string[];
}> = async (context) => {
  const { id, season, episode } = context.query;
  return { props: { id, season, episode } };
};
const Theater = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
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
    <div className="flex w-full lg:w-2/3 flex-col gap-2 p-4">
      <div>
        <Video
          title={episodeQuery.data.data.title}
          src={`http://localhost:3001/static${episodeQuery.data.data.src}`}
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
            Season 1
          </span>
        </div>
        <div className="w-full p-2 mt-4 max-h-20 bg-neutral-700 rounded-lg">
          <p className="break-words">{episodeQuery.data.data.plot}</p>
        </div>
      </div>
    </div>
  );
};

export default Theater;
