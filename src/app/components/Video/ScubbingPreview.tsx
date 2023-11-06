"use client";
import Image from "next/image";
type PreviewProps = {
  X: number;
  timelineWidth: number;
  time: string;
  src: string;
};

export default function ScrubbingPreview({
  time,
  X,
  src,
  timelineWidth,
}: PreviewProps) {
  const IMG_WIDTH = 150;
  const IMG_HEIGHT = 98;
  let position = X;
  if (X < IMG_WIDTH / 2) position = IMG_WIDTH / 2;
  if (timelineWidth - X < IMG_WIDTH / 2)
    position = timelineWidth - IMG_WIDTH / 2;
  return (
    <div
      className="pointer-events-none absolute bottom-14 hidden shrink-0 -translate-x-1/2 animate-fade-in flex-col items-center justify-center group-hover:flex"
      style={{
        left: `${position}px`,
        width: `${IMG_WIDTH}px`,
        height: `${IMG_HEIGHT}px`,
      }}
    >
      <div className="p-0.5">
        <Image
          width={IMG_WIDTH}
          height={IMG_HEIGHT}
          src={src}
          alt="Preview"
        ></Image>
      </div>
      <span className="rounded-md bg-black/40 p-0.5 text-sm">{time}</span>
    </div>
  );
}
