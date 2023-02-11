import Image from "next/image";
import Link from "next/link";
import Title from "../components/Title";
import { trpc } from "../utils/trpc";
type ShowCardProps = {
  season: number;
  imgUrl: string | null;
  blurData: string | null;
  href: string;
};
type WordbookCardProps = {
  title: string;
  wordsCount: number;
};
const ShowCard = ({ season, href, imgUrl, blurData }: ShowCardProps) => {
  return (
    <Link
      href={href}
      className="flex h-96 w-60 shrink-0 snap-center flex-col items-center gap-3 rounded-xl bg-neutral-700 p-1 duration-200 hover:scale-105"
    >
      <div className="relative aspect-video w-full flex-1">
        <Image
          src={imgUrl ?? "/image.jpg"}
          placeholder={blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${blurData}`}
          className="rounded-xl object-cover"
          alt="banner"
          fill
        />
      </div>
      <div>
        <span className="text-xl">{`Season ${season}`}</span>
      </div>
    </Link>
  );
};
const Home = () => {
  const randSeasons = trpc.theater.getRandomSeasons.useQuery(undefined, {
    staleTime: Infinity,
  });
  return (
    <>
      <Title title="Home" />
      <div className="relative h-full w-full flex-1 overflow-hidden p-2 dark:text-white">
        <div className="absolute top-0 left-0 w-full animate-blob bg-purple-600 blur-3xl"></div>
        <div className="w-full py-2">
          <span className="text-4xl">Shows for you</span>
        </div>
        <div className="flex h-full w-full snap-x gap-5 overflow-auto rounded-xl py-5">
          {randSeasons.data?.map((season) => (
            <ShowCard
              imgUrl={season.poster}
              blurData={season.blurData}
              season={season.number}
              key={season.id}
              href={`/theater/${season.showsId}/${season.number}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
