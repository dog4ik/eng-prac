import React from "react";
import Image from "next/image";
type HeaderProps = {
  title: string;
  subtitle: string | null;
  ratings?: number | null;
  description: string | null;
  img: string | null;
  blurData: string | null;
};
const TheaterHeader = ({
  title,
  subtitle,
  ratings,
  img,
  description,
  blurData,
}: HeaderProps) => {
  return (
    <div className="flex h-fit w-full flex-col items-center sm:flex-row sm:items-start sm:gap-10">
      <div className="relative h-80 max-h-80 w-60 overflow-hidden rounded-xl md:max-h-fit">
        <Image
          draggable={false}
          alt="cover"
          className="object-cover"
          fill
          sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        />
      </div>
      <div className="flex w-5/6 flex-col gap-2">
        <span className="text-2xl">{title}</span>
        <span className="text-sm text-white/90">{subtitle}</span>
        <div>
          {ratings && <span className="text-md">{`Imdb: ${ratings}`}</span>}
        </div>
        {description && <p className="mt-10 max-w-lg">{description}</p>}
      </div>
    </div>
  );
};

export default TheaterHeader;
