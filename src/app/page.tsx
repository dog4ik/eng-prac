import Image from "next/image";
import Link from "next/link";
import prisma from "../../prisma/PrismaClient";
import { type Season } from "@prisma/client";

type ShowCardProps = {
  season: number;
  imgUrl: string | null;
  blurData: string | null;
  href: string;
};

const ShowCard = ({ season, href, imgUrl, blurData }: ShowCardProps) => {
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
        <span className="text-lg sm:text-xl">{`Season ${season}`}</span>
      </div>
    </Link>
  );
};

async function getRandomSeasons() {
  const seasons = await prisma.$queryRawUnsafe(
    'SELECT "id","blur_data","number","poster","shows_id" FROM "Season" ORDER BY RANDOM() LIMIT 10;',
  );
  return seasons as Pick<
    Season,
    "id" | "blur_data" | "number" | "poster" | "shows_id"
  >[];
}

const Home = async () => {
  const randSeasons = await getRandomSeasons();
  return (
    <>
      <div className="relative h-full w-full flex-1 overflow-hidden p-2 dark:text-white">
        <div className="absolute left-0 top-0 w-full animate-blob bg-purple-600 blur-3xl"></div>
        <div className="w-full py-2">
          <span className="text-xl sm:text-4xl">Shows for you</span>
        </div>
        <div className="flex h-full w-full snap-x gap-5 overflow-auto rounded-xl py-5">
          {randSeasons.map((season) => (
            <ShowCard
              imgUrl={season.poster}
              blurData={season.blur_data}
              season={season.number}
              key={season.id}
              href={`/theater/${season.shows_id}/${season.number}`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
