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
      className={`grid h-28 w-full shrink-0 cursor-pointer grid-cols-2 grid-rows-1 items-center gap-2 overflow-hidden rounded-lg p-1 ${
        isCurrent
          ? "bg-white text-black"
          : " text-white duration-100 hover:bg-neutral-700"
      }`}
      ref={itemRef}
    >
      <div className="relative flex h-full w-1/2 items-center overflow-hidden rounded-lg xl:w-full">
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
        <span className="truncate text-sm">{`Episode ${episode.number}`}</span>
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
      onSuccess(data) {
        if (siblingsQuery.isSuccess) {
          const next = siblingsQuery.data.find(
            (item) => item.number == data?.number + 1
          );
          next
            ? setNextEp({
                title: next.title,
                poster: next.poster,
                src: `/theater/${data.showId}/${data.seasonNumber}/${
                  data.number + 1
                }`,
              })
            : setNextEp(null);
        }
      },
    }
  );
  const siblingsQuery = trpc.theater.getEpisodeSiblings.useQuery(
    {
      season: parseInt(props.season!.toString()),
      showId: props.id!.toString(),
    },
    {
      enabled: episodeQuery.isSuccess,
      onSuccess(data) {
        if (episodeQuery.isSuccess) {
          const next = data.find(
            (item) => item.number == episodeQuery.data.number + 1
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

      <div className="flex w-full flex-col justify-between gap-3 p-4 xl:flex-row">
        <div className="flex flex-col gap-2 xl:w-3/4" ref={containerRef}>
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
              <div className="flex flex-col justify-between lg:flex-row lg:items-center">
                <div>
                  <div>
                    <span className="text-xl font-semibold">
                      {episodeQuery.data.title}
                    </span>
                  </div>
                  <div>
                    <Link
                      href={`/theater/${episodeQuery.data.showId}/${episodeQuery.data.seasonNumber}`}
                      className="cursor-pointer text-sm hover:underline"
                    >
                      {`Season ${episodeQuery.data.seasonNumber}`}
                    </Link>
                  </div>
                </div>
                {episodeQuery.data.tmdbId && (
                  <div className="flex items-center gap-3">
                    <button
                      className="cursor-pointer truncate rounded-lg bg-white px-5 py-2 text-black"
                      onClick={() => {
                        setVideoEvents(false);
                        setIsSrtModalOpen();
                      }}
                    >
                      Download subs
                    </button>
                    {customSrt && (
                      <button
                        className="cursor-pointer rounded-lg py-1 px-2 transition-colors duration-200 hover:bg-red-500"
                        onClick={() => setCustomSrt(undefined)}
                      >
                        {customSrt?.split("/")[customSrt.split("/").length - 1]}
                      </button>
                    )}
                  </div>
                )}
              </div>
              {episodeQuery.data.plot && (
                <div className="min-h-20 mt-4 w-full rounded-lg bg-neutral-700 p-2">
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
              className="flex flex-col px-2 scrollbar-track-neutral-700 scrollbar-thumb-white scrollbar-w-1 xl:mr-10 xl:max-w-xl xl:overflow-y-auto "
            >
              {siblingsQuery.data?.map((episode) => (
                <SideBarEpisode
                  key={episode.id}
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
