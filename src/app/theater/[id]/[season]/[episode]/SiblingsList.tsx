import { getEpisodes } from "../../../../lib/mediaServer";
import SiblingEpisode from "./SiblingEpisode";

type Props = {
  currentEpisodeNumber: number;
  showId: string;
  season: number;
};

export default async function SiblingsList({
  season,
  showId,
  currentEpisodeNumber,
}: Props) {
  let siblings = await getEpisodes(+showId, season);
  if (!siblings) return null;
  return (
    <div className="w-full xl:w-1/3">
      <div className="flex flex-col px-2 scrollbar-track-neutral-700 scrollbar-thumb-white scrollbar-w-1 xl:mr-10 xl:max-w-xl xl:overflow-y-auto ">
        {siblings.map((episode) => (
          <SiblingEpisode
            key={episode.id}
            episode={{
              number: episode.number,
              title: episode.title,
              poster: episode.poster,
              blurData: episode.blur_data,
              duration: episode.duration,
            }}
            href={`/theater/${showId}/${season}/${episode.number}`}
            isCurrent={episode.number === currentEpisodeNumber}
          />
        ))}
      </div>
    </div>
  );
}
