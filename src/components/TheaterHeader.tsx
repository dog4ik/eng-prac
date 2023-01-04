import React from "react";
import Image from "next/image";
type HeaderProps = {
  title: string;
  subtitle?: string;
  ratings?: number;
  description?: string;
  img?: string;
};
const TheaterHeader = ({
  title,
  subtitle,
  ratings,
  img,
  description,
}: HeaderProps) => {
  return (
    <div className="w-full h-fit flex gap-10">
      <div className="w-1/6 relative overflow-hidden rounded-xl">
        <Image
          draggable={false}
          alt="cover"
          className="object-cover"
          fill
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
