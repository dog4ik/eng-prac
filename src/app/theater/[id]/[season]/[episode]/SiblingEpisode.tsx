import Link from "next/link";
import Image from "next/image";
import formatDuration from "../../../../../utils/formatDuration";

type SideBarType = {
  episode: {
    poster: string | null;
    blurData: string | null;
    title: string;
    number: number;
    duration: number;
  };
  href: string;
  isCurrent: boolean;
};

export default function SiblingEpisode({
  episode,
  href,
  isCurrent,
}: SideBarType) {
  // const itemRef = useRef<HTMLAnchorElement>(null);
  // useEffect(() => {
  //   if (isCurrent && window.innerWidth >= 1280)
  //     itemRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
  // }, []);250px

  return (
    <Link
      href={href}
      className={`grid h-28 w-full shrink-0 cursor-pointer grid-cols-2 grid-rows-1 items-center gap-2 overflow-hidden rounded-lg p-1 ${
        isCurrent
          ? "bg-white text-black"
          : " text-white duration-100 hover:bg-neutral-700"
      }`}
    >
      <div className="relative flex h-full items-center overflow-hidden rounded-lg md:w-1/2 xl:w-full">
        <Image
          src={episode.poster ?? "PLACEHOLDER"}
          placeholder={episode.blurData ? "blur" : "empty"}
          blurDataURL={`data:image/png;base64,${episode.blurData}`}
          fill
          sizes={"(max-width: 768px) 33vw, (max-width: 1280px) 25vw, 15vw"}
          className="object-cover"
          alt={"Episode Poster"}
        />
        <div className="absolute bottom-0 right-0 flex items-center p-1">
          <span className="rounded-md bg-black p-0.5 text-sm text-white">
            {formatDuration(episode.duration)}
          </span>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-5">
        <span className="text-md">{episode.title}</span>
        <span className="truncate text-sm">{`Episode ${episode.number}`}</span>
      </div>
    </Link>
  );
}
