import Video from "../../../../components/Video";
import EpisodeBar from "./EpisodeBar";
import SiblingsList from "./SiblingsList";
import { Suspense } from "react";
import Spinner from "../../../../components/loading/Spinner";
import VideoCtxProvider from "../../../../components/Video/VideoContext";
import { getEpisode } from "../../../../lib/mediaServer";

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
  let episode = await getEpisode(+params.id, +params.season, +params.episode);
  console.log(episode);

  return (
    <>
      <div className="flex w-full flex-col justify-between gap-3 p-4 xl:flex-row">
        <div className="flex flex-col gap-2 xl:w-3/4">
          <VideoCtxProvider>
            {
              // <SubtitlesModal tmdbId={episode.id} />
            }
            <Suspense fallback={<EpisodeBarLoading />}>
              <Video
                title={episode.title}
                id={episode.id}
                history={undefined}
                src={
                  process.env.MEDIA_SERVER_URL! +
                  `/api/watch?id=${episode.video_id}`
                }
                previewsAmount={episode.previews_amount}
                previewsSrc={
                  process.env.MEDIA_SERVER_URL! +
                  `/api/previews?id=${episode.video_id}&number=`
                }
                next={null}
              />
            </Suspense>
            <Suspense fallback={<EpisodeBarLoading />}>
              <EpisodeBar
                episodeNumber={+params.episode}
                seasonNumber={+params.season}
                showId={params.id.toString()}
              />
            </Suspense>
          </VideoCtxProvider>
        </div>
        <Suspense fallback={<SiblingsListLoading />}>
          <SiblingsList
            showId={params.id.toString()}
            season={+params.season}
            currentEpisodeNumber={+params.episode}
          />
        </Suspense>
      </div>
    </>
  );
}

export default Theater;
