import Video from "../../../../components/Video";
import EpisodeBar from "./EpisodeBar";
import SiblingsList from "./SiblingsList";
import SubtitlesModal from "./SubtitlesModal";
import { getEpisode } from "../../../../lib/serverFunctions/theater";
import { Suspense } from "react";
import Spinner from "../../../../components/loading/Spinner";
import VideoCtxProvider from "../../../../components/Video/VideoContext";

function SiblingsListLoading() {
  return (
    <div className="flex w-full items-center justify-center xl:w-1/3">
      <Spinner />
    </div>
  );
}

function EpisodeBarLoading() {
  return (
    <div className="flex w-full items-center justify-center">
      <Spinner />
    </div>
  );
}

async function Theater({
  params,
}: {
  params: {
    id: string;
    season: string;
    episode: string;
  };
}) {
  let episode = getEpisode(params.id, +params.season, +params.episode);

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-3 p-4 xl:flex-row">
        <div className="flex flex-col gap-2 xl:w-3/4">
          <VideoCtxProvider>
            <SubtitlesModal
              tmdbIdPromise={episode.then((data) => data?.tmdbId)}
            />
            <Suspense fallback={<EpisodeBarLoading />}>
              <Video episodePromise={episode} next={null} />
            </Suspense>
            <Suspense fallback={<EpisodeBarLoading />}>
              <EpisodeBar
                episodeNumber={+params.episode}
                seasonNumber={+params.season}
                showId={params.id}
              />
            </Suspense>
          </VideoCtxProvider>
        </div>
        <Suspense fallback={<SiblingsListLoading />}>
          <SiblingsList
            showId={params.id}
            season={+params.season}
            currentEpisodeNumber={+params.episode}
          />
        </Suspense>
      </div>
    </>
  );
}

export default Theater;
