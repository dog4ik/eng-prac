import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import TheaterHeader from "../../../components/TheaterHeader";
import { getSeasons } from "../../lib/serverFunctions/theater";
import BlockGrid from "../../components/ui/BlockGrid";
import SpinnerPage from "../../components/loading/SpinnerPage";

type SeasonCardProps = {
  img: string | null;
  blurData: string | null;
  title: string;
  episodes: number;
  href: string;
};

function SeasonCard({ img, title, episodes, href, blurData }: SeasonCardProps) {
  return (
    <div className="w-full">
      <Link
        href={href}
        className="relative flex h-80 cursor-pointer items-end justify-center overflow-hidden rounded-xl bg-neutral-500 duration-200 hover:scale-105"
      >
        <Image
          draggable={false}
          fill
          sizes="(max-width: 768px) 90vw,
          (max-width: 1200px) 33vw,
          10vw"
          className="object-cover"
          alt="Season poster"
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          src={
            img ??
            "https://images.unsplash.com/photo-1626846116799-ad61f874f99d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
          }
        ></Image>
      </Link>
      <div className="flex w-full flex-col gap-1 py-3">
        <div>
          <Link href={href} className="cursor-pointer text-lg">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="cursor-pointer text-sm text-neutral-300 hover:underline"
          >
            {`${episodes} episodes`}
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoadingCard() {
  return (
    <div className="h-60 w-40 animate-pulse rounded-xl bg-neutral-400"></div>
  );
}

export default async function Seasons({ params }: { params: { id: string } }) {
  let season = await getSeasons(params.id);

  return (
    <Suspense fallback={<SpinnerPage />}>
      <div className="flex flex-col gap-10 px-1 py-4 md:px-20">
        {season && (
          <TheaterHeader
            description={season.plot}
            blurData={season.blurData}
            img={season.poster}
            title={season.title}
            subtitle={season.releaseDate}
            ratings={Number(season.rating)}
          />
        )}
        <BlockGrid elementSize={160}>
          {season?.seasons.map((season) => (
            <SeasonCard
              key={season.id}
              img={season.poster}
              blurData={season.blurData}
              title={`Season ${season.number}`}
              episodes={season.episodesCount}
              href={params.id + "/" + season.number.toString()}
            />
          ))}
        </BlockGrid>
      </div>
    </Suspense>
  );
}
