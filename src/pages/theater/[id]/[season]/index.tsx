import Link from "next/link";
import Image from "next/image";
import React, { useRef } from "react";
import TheaterHeader from "../../../../components/TheaterHeader";
import useGridCols from "../../../../utils/useGrid";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Error from "../../../../components/ui/Error";
import { trpc } from "../../../../utils/trpc";
import NotFoundError from "../../../../components/ui/NotFoundError";
import Title from "../../../../components/Title";
import formatDuration from "../../../../utils/formatDuration";
import { FiCheck, FiMoreVertical } from "react-icons/fi";
import useToggle from "../../../../utils/useToggle";
import { createPortal } from "react-dom";
import { MenuRow, MenuWrapper } from "../../../../components/MenuWrapper";
import { useNotifications } from "../../../../components/context/NotificationCtx";
type EpisodeCardProps = {
  haveSubs: boolean;
  onMarkWatched: (hasWatched: boolean) => void;
  img: string | null;
  blurData: string | null;
  title: string;
  episode: number;
  href: string;
  duration: number;
  userTime?: number;
  isFinished: boolean;
};

export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
}> = async (context) => {
  const { id, season } = context.query;
  return { props: { id, season } };
};
const EpisodeCard = ({
  img,
  title,
  onMarkWatched,
  episode,
  href,
  blurData,
  haveSubs,
  duration,
  userTime,
  isFinished,
}: EpisodeCardProps) => {
  const getPercent = (larger: number, smaller?: number) => {
    if (!smaller) return 0;
    return (smaller / larger) * 100;
  };
  const [showModal, setShowModal] = useToggle(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  return (
    <>
      {showModal &&
        createPortal(
          <MenuWrapper
            callerRef={menuButtonRef}
            x={menuButtonRef.current?.getBoundingClientRect().right}
            y={menuButtonRef.current?.getBoundingClientRect().bottom}
            onClose={() => setShowModal(false)}
          >
            {isFinished ? (
              <MenuRow
                title="Mark as unwatched"
                onClick={() => {
                  setShowModal(false);
                  onMarkWatched(false);
                }}
              />
            ) : (
              <MenuRow
                title="Mark as watched"
                onClick={() => {
                  setShowModal(false);
                  onMarkWatched(true);
                }}
              />
            )}
          </MenuWrapper>,
          document.body
        )}
      <div className="group w-64 sm:w-80">
        <Link
          href={href}
          className="relative flex aspect-video cursor-pointer items-end justify-center overflow-hidden rounded-xl bg-neutral-500 duration-200 sm:hover:scale-105"
        >
          <Image
            draggable={false}
            fill
            sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
            className="object-cover"
            alt="Episode poster"
            placeholder={blurData ? "blur" : "empty"}
            blurDataURL={`data:image/png;base64,${blurData}`}
            src={
              img ??
              "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
            }
          ></Image>
          <div className="absolute top-0 right-0 flex items-center p-1">
            <span
              className={`inline-block rounded-xl px-1 py-0.5 text-sm ${
                haveSubs ? "bg-green-500" : "bg-red-500"
              }`}
            >
              Subs
            </span>
          </div>
          {isFinished && (
            <div className="absolute top-0 left-0 p-2">
              <div className="rounded-full bg-white p-1">
                <FiCheck className="stroke-black" size={25} />
              </div>
            </div>
          )}
          <div className="absolute bottom-0 right-0 flex items-center p-1">
            <span className="rounded-md bg-black p-0.5 text-sm">
              {formatDuration(duration)}
            </span>
          </div>
          <div className="absolute left-0 bottom-0 right-0">
            <div
              className="h-1 bg-white "
              style={{
                width: `${isFinished ? 100 : getPercent(duration, userTime)}%`,
              }}
            />
          </div>
        </Link>
        <div className="flex items-center">
          <div className="flex w-full flex-col gap-1 py-3">
            <Link title={title} className="truncate text-lg" href={href}>
              {title}
            </Link>
            <div>
              <Link
                href={href}
                className="cursor-pointer text-sm text-neutral-300 hover:underline"
              >
                {`Episode ${episode}`}
              </Link>
            </div>
          </div>
          <div
            ref={menuButtonRef}
            onClick={() => setShowModal()}
            className={`hidden cursor-pointer rounded-full p-2 sm:block ${
              showModal ? "opacity-100" : "opacity-0"
            } transition-all duration-100 group-hover:opacity-100 hover:bg-neutral-700`}
          >
            <FiMoreVertical size={20} />
          </div>
        </div>
      </div>
    </>
  );
};
const LoadingCard = () => {
  return (
    <div className="h-40 w-80 animate-ping rounded-xl bg-neutral-400"></div>
  );
};
const Season = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const cols = useGridCols(440);
  const queryClient = trpc.useContext();
  const notificator = useNotifications();
  const episodesQuery = trpc.theater.getEpisodes.useQuery({
    showId: props.id!.toString(),
    number: parseInt(props.season!.toString()),
  });
  const markWatchedMutation = trpc.history.markWatched.useMutation({
    onSuccess(_, variables) {
      notificator({
        type: "success",
        message: variables.isWatched
          ? "Marked as watched"
          : "Removed from watch history",
      });
      queryClient.theater.getEpisodes.invalidate();
    },
    onError(error) {
      if (error.data?.code == "UNAUTHORIZED")
        notificator({
          type: "error",
          message: "Log in to mark your history",
        });
      else
        notificator({
          type: "error",
          message: "Failed to mark episode",
        });
    },
  });
  if (episodesQuery.isError) {
    if (episodesQuery.error.data?.code === "NOT_FOUND")
      return <NotFoundError text="Season" />;
    return <Error />;
  }
  return (
    <>
      <Title
        title={
          episodesQuery.isSuccess
            ? `Season ${episodesQuery.data?.number}`
            : "Loading..."
        }
      />
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
        {episodesQuery.isSuccess && (
          <TheaterHeader
            description={episodesQuery.data.plot}
            blurData={episodesQuery.data.blurData}
            img={episodesQuery.data.poster}
            title={"Season " + episodesQuery.data.number}
            subtitle={`${episodesQuery.data.releaseDate}`}
          />
        )}
        <div
          className="grid w-full auto-rows-auto place-items-center items-center justify-center gap-5 py-4"
          style={cols}
        >
          {episodesQuery.isLoading && [...Array(4).map((_) => <LoadingCard />)]}

          {episodesQuery.isSuccess &&
            episodesQuery.data.episodes.map((episode) => (
              <EpisodeCard
                haveSubs={episode.subSrc !== null}
                duration={episode.duration}
                key={episode.id}
                img={episode.poster}
                blurData={episode.blurData}
                title={episode.title}
                episode={episode.number}
                href={`/theater/${props.id}/${props.season}/${episode.number}`}
                onMarkWatched={(result) =>
                  markWatchedMutation.mutate({
                    isWatched: result,
                    episodeId: episode.id,
                  })
                }
                userTime={
                  episodesQuery.data.history.find(
                    (item) => item.episodeId === episode.id
                  )?.time
                }
                isFinished={
                  episodesQuery.data.history.find(
                    (item) => item.episodeId === episode.id
                  )?.isFinished ?? false
                }
              />
            ))}
        </div>
      </div>
    </>
  );
};

export default Season;
