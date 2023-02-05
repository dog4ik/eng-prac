import Image from "next/image";
import Link from "next/link";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Error from "../../../../components/ui/Error";
import Video from "../../../../components/Video";
import SrtModal from "../../../../components/modals/SrtModal";
import useToggle from "../../../../utils/useToggle";
import { trpc } from "../../../../utils/trpc";
import NotFoundError from "../../../../components/ui/NotFoundError";
import UnauthorizedError from "../../../../components/ui/UnauthorizedError";
import Title from "../../../../components/Title";

type SideBarType = {
  episode: {
    poster: string | null;
    blurData: string | null;
    title: string;
    number: number;
  };
  href: string;
  isCurrent: boolean;
};

type NextEpisode = {
  title: string;
  poster: string | null;
  src: string;
} | null;
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
  season?: string | string[];
  episode?: string | string[];
}> = async (context) => {
  const { id, season, episode } = context.query;
  return { props: { id, season, episode } };
};

const SideBarEpisode = ({ episode, href, isCurrent }: SideBarType) => {
  const itemRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (isCurrent && window.innerWidth >= 1280)
      itemRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
  }, []);

  return (
    <Link
      href={href}
      className={`grid grid-rows-1 grid-cols-2 p-1 cursor-pointer overflow-hidden gap-2 items-center shrink-0 h-28 w-full rounded-lg ${
        isCurrent
          ? "bg-white text-black"
          : " hover:bg-neutral-700 duration-100 text-white"
      }`}
      ref={itemRef}
    >
      <div className="xl:w-full w-1/2 relative h-full flex overflow-hidden rounded-lg items-center">
        <Image
          src={episode.poster ?? "PLACEHOLDER"}
          placeholder={episode.blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${episode.blurData}`}
          fill
          className="object-cover"
          alt={"Episode Poster"}
        />
      </div>
      <div className="flex flex-col justify-center gap-5">
        <span className="text-md">{episode.title}</span>
        <span className="text-sm truncate">{`Episode ${episode.number}`}</span>
      </div>
    </Link>
  );
};

const Theater = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [isSrtModalOpen, setIsSrtModalOpen] = useToggle(false);
  const [customSrt, setCustomSrt] = useState<string>();
  const [videoEvents, setVideoEvents] = useToggle(true);
  const [height, setHeight] = useState(0);
  const [nextEp, setNextEp] = useState<NextEpisode>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    setHeight(containerRef.current?.clientHeight ?? 0);
  }, []);
  const episodeQuery = trpc.theater.getEpisode.useQuery(
    {
      showId: props.id!.toString(),
      episodeNumber: parseInt(props.episode!.toString()),
      seasonNumber: parseInt(props.season!.toString()),
    },
    {
      onSettled() {
        setCustomSrt(undefined);
      },
    }
  );
  const siblingsQuery = trpc.theater.getEpisodeSiblings.useQuery(
    {
      season: parseInt(props.season!.toString()),
      showId: props.id!.toString(),
    },
    {
      enabled: !episodeQuery.isLoading,
      onSuccess(data) {
        if (episodeQuery.isSuccess) {
          const next = data.find(
            (item) => item.number == episodeQuery.data?.number + 1
          );
          next
            ? setNextEp({
                title: next.title,
                poster: next.poster,
                src: `/theater/${episodeQuery.data.showId}/${
                  episodeQuery.data.seasonNumber
                }/${episodeQuery.data.number + 1}`,
              })
            : setNextEp(null);
        }
      },
    }
  );
  if (episodeQuery.isError) {
    if (episodeQuery.error.data?.code === "UNAUTHORIZED")
      return <UnauthorizedError />;
    if (episodeQuery.error.data?.code === "NOT_FOUND")
      return <NotFoundError text="Episode" />;
    return <Error />;
  }
  return (
    <>
      <Title title={episodeQuery.data?.title ?? "Loading..."} />
      {isSrtModalOpen && episodeQuery.isSuccess && episodeQuery.data.tmdbId && (
        <SrtModal
          handleClose={() => {
            setIsSrtModalOpen(false);
            setVideoEvents(true);
          }}
          tmdbId={episodeQuery.data.tmdbId}
          onChoose={(link) => setCustomSrt(link)}
        />
      )}

      <div className="flex flex-col p-4 xl:flex-row justify-between w-full gap-3">
        <div className="flex xl:w-3/4 flex-col gap-2" ref={containerRef}>
          <div className="">
            <Video
              isLoading={episodeQuery.isLoading}
              preventEvents={!videoEvents}
              title={episodeQuery.data?.title ?? ""}
              next={nextEp}
              src={episodeQuery.data?.src ?? ""}
              subSrc={
                customSrt ??
                (episodeQuery.data?.subSrc == null
                  ? null
                  : episodeQuery.data?.subSrc)
              }
            />
          </div>
          {episodeQuery.isSuccess && (
            <div className="flex flex-col">
              <div className="flex justify-between flex-col lg:flex-row lg:items-center">
                <div>
                  <div>
                    <span className="text-xl font-semibold">
                      {episodeQuery.data.title}
                    </span>
                  </div>
                  <div>
                    <Link
                      href={`/theater/${episodeQuery.data.showId}/${episodeQuery.data.seasonNumber}`}
                      className="text-sm cursor-pointer hover:underline"
                    >
                      {`Season ${episodeQuery.data.seasonNumber}`}
                    </Link>
                  </div>
                </div>
                {episodeQuery.data.tmdbId && (
                  <div className="flex items-center gap-3">
                    <button
                      className="px-5 cursor-pointer text-black py-2 bg-white rounded-lg truncate"
                      onClick={() => {
                        setVideoEvents(false);
                        setIsSrtModalOpen();
                      }}
                    >
                      Download subs
                    </button>
                    {customSrt && (
                      <button
                        className="py-1 px-2 hover:bg-red-500 rounded-lg duration-200 transition-colors cursor-pointer"
                        onClick={() => setCustomSrt(undefined)}
                      >
                        {customSrt?.split("/")[customSrt.split("/").length - 1]}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {episodeQuery.data.plot && (
                <div className="w-full p-2 mt-4 min-h-20 bg-neutral-700 rounded-lg">
                  <p className="break-words">{episodeQuery.data.plot}</p>
                </div>
              )}
            </div>
          )}
        </div>
        {siblingsQuery.isSuccess && (
          <div>
            <div
              style={{ height: height }}
              className="flex xl:max-w-xl px-2 flex-col xl:overflow-y-auto xl:mr-10 scrollbar-w-1 scrollbar-thumb-white scrollbar-track-neutral-700 "
            >
              {siblingsQuery.data?.map((episode) => (
                <SideBarEpisode
                  episode={{
                    number: episode.number,
                    title: episode.title,
                    poster: episode.poster,
                    blurData: episode.blurData,
                  }}
                  href={`/theater/${episodeQuery.data?.showId}/${episodeQuery.data?.seasonNumber}/${episode.number}`}
                  isCurrent={episode.id === episodeQuery.data?.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Theater;
