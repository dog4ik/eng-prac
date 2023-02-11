import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { FiClock, FiTrash, FiX } from "react-icons/fi";
import { useNotifications } from "../components/context/NotificationCtx";
import Title from "../components/Title";
import Error from "../components/ui/Error";
import Loading from "../components/ui/Loading";
import formatDuration from "../utils/formatDuration";
import { trpc } from "../utils/trpc";
type HistoryItemProps = {
  title: string;
  onDelete: () => void;
  season: number;
  episode: number;
  plot: string | null;
  poster: string | null;
  blurData: string | null;
  showId: string;
  duration: number;
  userTime: number;
};
const getPersent = (first: number, second: number) => {
  return (second / first) * 100;
};
const HistoryItem = ({
  title,
  onDelete,
  episode,
  season,
  showId,
  plot,
  poster,
  blurData,
  duration,
  userTime,
}: HistoryItemProps) => {
  const episodeHref = useRef(`theater/${showId}/${season}/${episode}`);
  return (
    <div className="group flex max-h-64 max-w-5xl rounded-xl">
      <Link
        href={episodeHref.current}
        className="relative mr-2 aspect-video w-1/3 overflow-hidden rounded-xl duration-200 hover:scale-105"
      >
        <Image
          className="object-cover"
          src={poster ?? "/image.jpg"}
          alt="History Item"
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          fill
        />
        <div className="absolute bottom-0 right-0 p-1">
          <span className="rounded-md bg-black p-0.5 text-sm">
            {formatDuration(duration)}
          </span>
        </div>
        <div
          className="absolute bottom-0 right-0 left-0 h-1 bg-white"
          style={{ width: `${getPersent(duration, userTime)}%` }}
        ></div>
      </Link>
      <Link href={episodeHref.current} className="relative flex w-2/3 flex-col">
        <div className="block">
          <span className="w-5/6 truncate whitespace-normal p-1 text-xl font-semibold line-clamp-2">
            {title}
          </span>
          <div className="flex items-center gap-1 text-neutral-300">
            <Link
              href={`theater/${showId}/${season}/`}
              className="p-1 duration-100 hover:text-white"
            >
              Season {season}
            </Link>
            <span>|</span>
            <span className="p-1">Episode {episode}</span>
          </div>
        </div>
        <div className="block p-1">
          <p
            title={plot ?? ""}
            className="overflow-hidden overflow-ellipsis whitespace-normal text-neutral-300 line-clamp-2"
          >
            {plot ?? ""}
          </p>
        </div>
        <div
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="absolute right-0 top-0 flex items-center justify-center rounded-full p-2 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-neutral-700"
        >
          <FiX size={30} />
        </div>
      </Link>
    </div>
  );
};
const History = () => {
  const historyQuery = trpc.history.getPaginatedHistory.useInfiniteQuery(
    {
      limit: 10,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const queryClient = trpc.useContext();
  const notificator = useNotifications();
  const observableRef = useRef<HTMLDivElement>(null);
  const deleteHistoryItemMutation = trpc.history.deleteHistoryItem.useMutation({
    onSuccess(data) {
      if (data.count)
        notificator({ type: "success", message: "History Item Removed" });
    },
    onError() {
      notificator({ type: "error", message: "Failed to delete history" });
    },
    onSettled() {
      queryClient.history.getPaginatedHistory.invalidate();
    },
  });
  const deleteMutation = trpc.history.deleteHistory.useMutation({
    onSuccess() {
      notificator({ type: "success", message: "History Removed" });
      queryClient.history.getPaginatedHistory.invalidate();
    },
  });
  const onObserve = (entires: IntersectionObserverEntry[]) => {
    const [entry] = entires;
    if (entry.isIntersecting && historyQuery.hasNextPage) {
      historyQuery.fetchNextPage();
    }
  };
  const options: IntersectionObserverInit = {
    root: null,
    rootMargin: "0px",
    threshold: 0,
  };
  useEffect(() => {
    const observer = new IntersectionObserver(onObserve, options);
    if (observableRef.current) observer.observe(observableRef.current);
    return () => {
      if (observableRef.current) observer.unobserve(observableRef.current);
    };
  }, [observableRef.current, options]);
  if (historyQuery.isLoading) {
    return <Loading />;
  }
  if (historyQuery.isError) {
    return <Error />;
  }
  return (
    <>
      <Title title="History" />
      <div className="flex h-full w-full flex-col-reverse p-5 md:flex-row">
        <div className="md:w-2/3">
          <div className="flex items-center gap-1">
            <div className="flex items-center justify-center">
              <FiClock size={35} />
            </div>
            <span className="p-2 text-2xl font-semibold">History</span>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {historyQuery.data.pages[0].history.length == 0 && (
              <div className="flex h-60 items-center justify-center">
                <span className="text-4xl">History is empty</span>
              </div>
            )}
            {historyQuery.data.pages.map((page) => {
              return page.history.map((item) => (
                <HistoryItem
                  onDelete={() =>
                    deleteHistoryItemMutation.mutate({ id: item.id })
                  }
                  plot={item.Episode.plot}
                  title={item.Episode.title}
                  key={item.id}
                  season={item.Episode.Season?.number ?? 1}
                  episode={item.Episode.number}
                  poster={item.Episode.poster}
                  blurData={item.Episode.blurData}
                  showId={item.Episode.Season?.showsId ?? ""}
                  userTime={item.time}
                  duration={item.Episode.duration}
                />
              ));
            })}
          </div>
          <div
            className="flex w-full items-center justify-center text-2xl"
            ref={observableRef}
          >
            {historyQuery.isFetchingNextPage && "Loading..."}
          </div>
        </div>
        <div className="md:w-1/3">
          <span className="p-2 text-2xl font-semibold">Options</span>
          <div className="my-4 flex items-center gap-3">
            <button
              className="flex items-center gap-4 rounded-full p-2 duration-100 hover:bg-neutral-700"
              onClick={() => deleteMutation.mutate()}
            >
              <FiTrash size={40} />
              <span className="text-xl">Delete my history</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default History;
