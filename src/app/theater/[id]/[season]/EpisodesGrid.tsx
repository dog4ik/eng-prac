"use client";
import BlockGrid from "../../../components/ui/BlockGrid";
import EpisodeCard from "./EpisodeCard";
import { AuthQueryReturnType } from "../../../lib/utils/authAction";
import { getHistoryForEpisodes } from "../../../lib/actions/authorized/history";
import { useAuthQuery } from "../../../lib/utils/useAuthActions";
import { EpisodeWithDetails } from "../../../lib/mediaServer";

type Props = {
  episodes: EpisodeWithDetails[];
  showId: string;
  seasonNumber: number;
  historyQuery?: AuthQueryReturnType<typeof getHistoryForEpisodes>;
};

const EpisodesGrid = ({
  episodes,
  showId,
  seasonNumber,
  historyQuery,
}: Props) => {
  let history = historyQuery ? useAuthQuery(historyQuery) : undefined;
  return (
    <BlockGrid elementSize={256}>
      {episodes.map((episode) => {
        let episodesHistory = history?.find(
          (item) => item.episode_id == episode.id.toString(),
        );
        return (
          <EpisodeCard
            haveSubs={episode.subtitles_amount > 0}
            duration={episode.duration}
            key={episode.id}
            img={episode.poster}
            blurData={episode.blur_data}
            title={episode.title}
            episode={episode.number}
            href={`/theater/${showId}/${seasonNumber}/${episode.number}`}
            id={episode.id.toString()}
            isFinished={episodesHistory ? episodesHistory.is_finished : false}
            userTime={episodesHistory ? episodesHistory.time : undefined}
          />
        );
      })}
    </BlockGrid>
  );
};

export default EpisodesGrid;
