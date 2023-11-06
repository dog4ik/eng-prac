"use client";

import Link from "next/link";
import Image from "next/image";
import formatDuration from "../../utils/formatDuration";
import { FiX } from "react-icons/fi";

function getPercent(first: number, second: number) {
  return (second / first) * 100;
}

type HistoryItemProps = {
  title: string;
  onDelete: () => void;
  season: number;
  episode: number;
  plot: string | null;
  poster: string | null;
  blurData: string | null;
  isFinished: boolean;
  showId: string;
  duration: number;
  userTime: number;
};

export default function HistoryEntry({
  title,
  onDelete,
  episode,
  season,
  showId,
  plot,
  isFinished,
  poster,
  blurData,
  duration,
  userTime,
}: HistoryItemProps) {
  const episodeHref = `theater/${showId}/${season}/${episode}`;
  return (
    <div className="group flex max-h-64 max-w-5xl rounded-xl">
      <Link
        href={episodeHref}
        className="relative mr-2 aspect-video w-1/2 overflow-hidden rounded-xl duration-200 sm:w-1/3 sm:hover:scale-105"
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
          className="absolute bottom-0 left-0 right-0 h-1 bg-white"
          style={{
            width: `${isFinished ? "100" : getPercent(duration, userTime)}%`,
          }}
        ></div>
      </Link>
      <Link
        href={episodeHref}
        className="relative flex w-1/2 flex-col sm:w-2/3"
      >
        <div>
          <span className="line-clamp-2 w-5/6 truncate whitespace-normal p-1 text-sm font-semibold sm:text-xl">
            {title}
          </span>
          <div className="flex items-center gap-1 text-neutral-300">
            <Link
              href={`theater/${showId}/${season}/`}
              className="p-1 duration-100 sm:hover:text-white"
            >
              Season {season}
            </Link>
            <span className="hidden sm:inline">|</span>
            <span className="hidden p-1 sm:inline">Episode {episode}</span>
          </div>
        </div>
        <div className="hidden p-1 sm:block">
          <p
            title={plot ?? ""}
            className="line-clamp-2 overflow-hidden overflow-ellipsis whitespace-normal text-neutral-300"
          >
            {plot ?? ""}
          </p>
        </div>
        <div
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          className="absolute right-0 top-0 flex items-center justify-center rounded-full p-2 transition-all duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:bg-neutral-700"
        >
          <FiX size={30} />
        </div>
      </Link>
    </div>
  );
}
