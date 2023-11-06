"use client";

import { useEffect, useRef, useState } from "react";
import { HistoryType } from "./page";
import HistoryEntry from "./HistoryEntry";
import { removeHistoryEntryAction } from "../lib/actions/authorized/history";

type Props = {
  history: HistoryType;
};

export default function HistoryList({ history }: Props) {
  const observableRef = useRef<HTMLDivElement>(null);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const onObserve = (entires: IntersectionObserverEntry[]) => {
    const [entry] = entires;
    if (entry.isIntersecting) {
      // fetch next page
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
  return (
    <>
      <div className="flex flex-col gap-3 p-4">
        {history.length == 0 && (
          <div className="flex h-60 items-center justify-center">
            <span className="text-4xl">History is empty</span>
          </div>
        )}
        {history.map((item) => (
          <HistoryEntry
            onDelete={() => removeHistoryEntryAction(item.id)}
            plot={item.Episode.plot}
            title={item.Episode.title}
            key={item.id}
            season={item.Episode.Season?.number ?? 1}
            episode={item.Episode.number}
            poster={item.Episode.poster}
            blurData={item.Episode.blurData}
            showId={item.Episode.Season?.showsId ?? ""}
            userTime={item.time}
            isFinished={item.isFinished}
            duration={item.Episode.duration}
          />
        ))}
      </div>
      <div
        className="flex w-full items-center justify-center text-2xl"
        ref={observableRef}
      >
        {isFetchingNext && "Loading..."}
      </div>
    </>
  );
}
