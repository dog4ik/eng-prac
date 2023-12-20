import Image from "next/image";
import Link from "next/link";
import { getAllShows } from "./lib/mediaServer";

type ShowCardProps = {
  imgUrl: string | null;
  blurData: string | null;
  title: string;
  href: string;
};

const ShowCard = ({ href, imgUrl, blurData, title }: ShowCardProps) => {
  return (
    <Link
      href={href}
      className="flex h-52 w-32 shrink-0 snap-center flex-col items-center gap-3 rounded-xl bg-neutral-700 p-1 duration-200 hover:scale-105 sm:h-96 sm:w-60"
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
        <span className="text-lg sm:text-xl">{`${title}`}</span>
      </div>
    </Link>
  );
};

const Home = async () => {
  const shows = await getAllShows();
  return (
    <>
      <div className="relative h-full w-full flex-1 overflow-hidden p-2 dark:text-white">
        <div className="absolute left-0 top-0 w-full animate-blob bg-purple-600 blur-3xl"></div>
        <div className="w-full py-2">
          <span className="text-xl sm:text-4xl">Shows for you</span>
        </div>
        <div className="flex h-full w-full snap-x gap-5 overflow-auto rounded-xl py-5">
          {shows.map((show) => (
            <ShowCard
              imgUrl={show.poster}
              blurData={show.blur_data}
              title={show.title}
              key={show.id}
              href={`/theater/${show.id}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
