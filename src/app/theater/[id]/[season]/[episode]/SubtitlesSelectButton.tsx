"use client";
import { useVideoContext } from "../../../../components/Video/VideoContext";

export default function SubtitlesSelectButton() {
  let { preventEvents, changeSubtitles, subtitlesUrl } = useVideoContext();
  return (
    <div className="flex items-center gap-3">
      <button
        className="cursor-pointer truncate rounded-lg bg-white px-5 py-2 text-black"
        onClick={() => {
          preventEvents(true);
        }}
      >
        Download subs
      </button>
      {subtitlesUrl && (
        <button
          className="cursor-pointer rounded-lg px-2 py-1 transition-colors duration-200 hover:bg-red-500"
          onClick={() => changeSubtitles(undefined)}
        >
          {subtitlesUrl?.split("/")[subtitlesUrl.split("/").length - 1]}
        </button>
      )}
    </div>
  );
}
