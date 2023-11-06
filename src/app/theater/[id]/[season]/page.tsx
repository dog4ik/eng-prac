import TheaterHeader from "../../../../components/TheaterHeader";
import { getEpisodes } from "../../../lib/serverFunctions/theater";
import { Suspense } from "react";
import SpinnerPage from "../../../components/loading/SpinnerPage";
import { getHistoryForEpisodes } from "../../../lib/actions/authorized/history";
import { authQuery } from "../../../lib/utils/authAction";
import EpisodesGrid from "./EpisodesGrid";

const LoadingCard = () => {
  return (
    <div className="h-40 w-80 animate-ping rounded-xl bg-neutral-400"></div>
  );
};

async function Season({ params }: { params: { id: string; season: string } }) {
  let episodes = await getEpisodes(params.id, +params.season);
  let history = authQuery(() =>
    getHistoryForEpisodes(episodes?.episodes.map((e) => e.id) ?? []),
  );
  if (!episodes) return null;
  return (
    <Suspense fallback={<SpinnerPage />}>
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
        {
          <TheaterHeader
            description={episodes.plot}
            blurData={episodes.blurData}
            img={episodes.poster}
            title={"Season " + episodes.number}
            subtitle={`${episodes.releaseDate}`}
          />
        }
        <EpisodesGrid
          seasonNumber={+params.season}
          showId={params.id}
          historyQuery={history}
          episodes={episodes.episodes}
        />
      </div>
    </Suspense>
  );
}

export default Season;
