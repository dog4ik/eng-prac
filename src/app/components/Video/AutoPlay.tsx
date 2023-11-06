"use client";

import { useEffect, useState } from "react";
import { NextEpisode } from ".";
import useToggle from "../../../utils/useToggle";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiRepeat } from "react-icons/fi";

export default function AutoPlay({
  next,
  onRepeat,
  onNext,
}: {
  next: NextEpisode;
  onRepeat: () => void;
  onNext: () => void;
}) {
  let timeout: ReturnType<typeof setTimeout>;
  let interval: ReturnType<typeof setInterval>;
  const [countDown, setCountDown] = useState(10);
  const [isCanceled, setIsCanceled] = useToggle(false);
  const router = useRouter();
  useEffect(() => {
    if (next && !isCanceled) {
      timeout = setTimeout(() => {
        onNext();
        router.push(next.src);
      }, 10_000);
      interval = setInterval(() => setCountDown((prev) => prev - 1), 1000);
    }
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [isCanceled]);
  const handleCancel = () => {
    clearTimeout(timeout);
    clearInterval(interval);
    setIsCanceled(true);
  };
  if (next)
    return (
      <div className="absolute left-1/2 top-1/2 flex h-fit max-h-96 w-80 max-w-2xl -translate-x-1/2 -translate-y-1/2 select-none flex-col items-center gap-3 rounded-lg bg-black px-10 py-3">
        <div className="w-full p-1 text-center">
          <div className="text-xl">
            {isCanceled ? "Up next" : "Next one starts in "}
            {!isCanceled && (
              <span className="">{countDown > 0 ? countDown : 0}</span>
            )}
          </div>
        </div>
        <div className="relative hidden aspect-video w-full max-w-lg overflow-hidden rounded-xl p-4 md:block">
          {next.poster ? (
            <Image
              draggable={false}
              alt="Next episode poster"
              src={next.poster}
              fill
              sizes="300px"
            ></Image>
          ) : (
            <div></div>
          )}
        </div>
        <div>
          <span className="truncate text-lg">{next.title}</span>
        </div>
        <div className="flex w-full items-center gap-5">
          {!isCanceled && (
            <button
              className="w-full rounded-xl bg-black px-4 py-2 text-white"
              onClick={handleCancel}
            >
              Cancel
            </button>
          )}
          <Link
            className="w-full rounded-xl bg-white px-4 py-2 text-center text-black"
            href={next.src}
            onClick={() => onNext()}
          >
            Next
          </Link>
        </div>
      </div>
    );
  return (
    <div
      className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center justify-center rounded-full"
      onClick={onRepeat}
    >
      <FiRepeat size={50} />
    </div>
  );
}
