import { Suspense } from "react";
import SpinnerPage from "../../../components/loading/SpinnerPage";
import EpisodesGrid from "./EpisodesGrid";
import TheaterHeader from "../../../components/theater/TheaterHeader";
import { getEpisodes, getSeason } from "../../../lib/mediaServer";

function LoadingCard() {
  return (
    <div className="h-40 w-80 animate-ping rounded-xl bg-neutral-400"></div>
  );
}

async function Season({ params }: { params: { id: number; season: number } }) {
  let [episodes, season] = await Promise.all([
    getEpisodes(params.id, params.season),
    getSeason(params.id, params.season),
  ]);
  return (
    <Suspense fallback={<SpinnerPage />}>
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
        {
          <TheaterHeader
            description={season.plot}
            blurData={season.blur_data}
            img={season.poster}
            title={"Season " + season.number}
            subtitle={season.release_date}
          />
        }
        <EpisodesGrid
          seasonNumber={+params.season}
          showId={params.id.toString()}
          historyQuery={undefined}
          episodes={episodes}
        />
      </div>
    </Suspense>
  );
}

export default Season;
