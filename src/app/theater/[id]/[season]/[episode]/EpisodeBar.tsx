import Link from "next/link";
import SubtitlesSelectButton from "./SubtitlesSelectButton";
import { getEpisode } from "../../../../lib/mediaServer";

type Props = {
  showId: string;
  seasonNumber: number;
  episodeNumber: number;
};

export default async function EpisodeBar({
  showId,
  episodeNumber,
  seasonNumber,
}: Props) {
  let episode = await getEpisode(+showId, seasonNumber, episodeNumber);
  return (
    <div className="flex flex-col">
      <div className="flex flex-col justify-between lg:flex-row lg:items-center">
        <div>
          <div>
            <span className="text-xl font-semibold">{episode.title}</span>
          </div>
          <div>
            <Link
              href={`/theater/${episode.id}/${seasonNumber}`}
              className="cursor-pointer text-sm hover:underline"
            >
              {`Season ${seasonNumber}`}
            </Link>
          </div>
        </div>
        {episode.id && <SubtitlesSelectButton />}
      </div>
      {episode.plot && (
        <div className="min-h-20 mt-4 w-full rounded-lg bg-neutral-700 p-2">
          <p className="break-words">{episode.plot}</p>
        </div>
      )}
    </div>
  );
}