"use client";
import React, { Suspense } from "react";
import BlockGrid from "../../../components/ui/BlockGrid";
import EpisodeCard from "./EpisodeCard";
import { AuthQueryReturnType } from "../../../lib/utils/authAction";
import {
  getHistoryForEpisodes,
  markWatchedAction,
} from "../../../lib/actions/authorized/history";
import { useAuthQuery } from "../../../lib/utils/useAuthActions";

type Props = {
  episodes: {
    number: number;
    id: string;
    releaseDate: string;
    poster: string;
    blurData: string | null;
    title: string;
    externalSubs: string[];
    rating: number;
    duration: number;
  }[];
  showId: string;
  seasonNumber: number;
  historyQuery: AuthQueryReturnType<typeof getHistoryForEpisodes>;
};

const EpisodesGrid = ({
  episodes,
  showId,
  seasonNumber,
  historyQuery,
}: Props) => {
  let history = useAuthQuery(historyQuery);
  return (
    <BlockGrid elementSize={256}>
      {episodes.map((episode) => {
        let episodesHistory = history.find(
          (item) => item.episodeId == episode.id,
        );
        return (
          <EpisodeCard
            haveSubs={episode.externalSubs.length > 0}
            duration={episode.duration}
            key={episode.id}
            img={episode.poster}
            blurData={episode.blurData}
            title={episode.title}
            episode={episode.number}
            href={`/theater/${showId}/${seasonNumber}/${episode.number}`}
            id={episode.id}
            isFinished={episodesHistory ? episodesHistory.isFinished : false}
            userTime={episodesHistory ? episodesHistory.time : undefined}
          />
        );
      })}
    </BlockGrid>
  );
};

export default EpisodesGrid;
