"use client";

import { useRef } from "react";
import useToggle from "../../../../utils/useToggle";
import { createPortal } from "react-dom";
import { MenuRow, MenuWrapper } from "../../../components/ContextMenu";
import Link from "next/link";
import Image from "next/image";
import { FiCheck, FiMoreVertical } from "react-icons/fi";
import formatDuration from "../../../../utils/formatDuration";
import { useAuthMutation } from "../../../lib/utils/useAuthActions";
import { markWatchedAction } from "../../../lib/actions/authorized/history";

function getPercent(larger: number, smaller?: number) {
  if (!smaller) return 0;
  return (smaller / larger) * 100;
}

type EpisodeCardProps = {
  haveSubs: boolean;
  img: string | null;
  blurData: string | null;
  title: string;
  episode: number;
  href: string;
  duration: number;
  userTime?: number;
  isFinished: boolean;
  id: string;
};

export default function EpisodeCard({
  img,
  title,
  episode,
  href,
  blurData,
  haveSubs,
  duration,
  userTime,
  isFinished,
  id,
}: EpisodeCardProps) {
  const [showModal, setShowModal] = useToggle(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  let menuButtonBounds = menuButtonRef.current?.getBoundingClientRect();
  const markWatched = useAuthMutation(async (isWatched: boolean) =>
    markWatchedAction(id, isWatched),
  );

  return (
    <>
      {showModal &&
        createPortal(
          <MenuWrapper
            callerRef={menuButtonRef}
            x={menuButtonBounds?.right}
            y={menuButtonBounds?.bottom}
            onClose={() => setShowModal(false)}
          >
            {isFinished ? (
              <MenuRow
                title="Mark as unwatched"
                onClick={() => {
                  setShowModal(false);
                  markWatched(false);
                }}
              />
            ) : (
              <MenuRow
                title="Mark as watched"
                onClick={() => {
                  setShowModal(false);
                  markWatched(true);
                }}
              />
            )}
          </MenuWrapper>,
          document.body,
        )}

      <div className="group w-full">
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
          <div className="absolute right-0 top-0 flex items-center p-1">
            <span
              className={`inline-block rounded-xl px-1 py-0.5 text-sm ${
                haveSubs ? "bg-green-500" : "bg-red-500"
              }`}
            >
              Subs
            </span>
          </div>
          {isFinished && (
            <div className="absolute left-0 top-0 p-2">
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
          <div className="absolute bottom-0 left-0 right-0">
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
}
