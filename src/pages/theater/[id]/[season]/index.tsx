import Link from "next/link";
import Image from "next/image";
import React from "react";
import TheaterHeader from "../../../../components/TheaterHeader";
import useGridCols from "../../../../utils/useGrid";
type EpisodeCardProps = {
  img: string;
  title: string;
  episode: number;
  href: string;
};
const EpisodeCard = ({ img, title, episode, href }: EpisodeCardProps) => {
  return (
    <div>
      <div className="relative cursor-pointer hover:scale-105 duration-200 overflow-hidden aspect-video rounded-xl bg-neutral-500 w-80 flex justify-center items-end">
        <Link href={href}>
          <Image
            draggable={false}
            fill
            className="object-cover"
            alt="cover"
            src={img}
          ></Image>
        </Link>
      </div>
      <div className="py-3 flex flex-col gap-1 w-full">
        <div>
          <Link href={href} className="text-lg cursor-pointer">
            {title}
          </Link>
        </div>
        <div>
          <Link
            href={href}
            className="text-sm text-neutral-300 hover:underline cursor-pointer"
          >
            {`Episode ${episode}`}
          </Link>
        </div>
      </div>
    </div>
  );
};
const Season = () => {
  const cols = useGridCols(440);

  return (
    <div className="px-1 md:px-20 flex-col flex gap-10 py-4">
      <TheaterHeader
        description="Второй сезон телесериала начинается с того, что Рейчел влюбляется в Росса и с нетерпением ждет его возвращения из Китая, чтобы сказать ему это. Но тот возвращается домой не один, а со своей новой девушкой Джули. Моника находит хорошего мужчину, с которым хочет создать серьезные и длительные отношения, но проблема состоит в том, что это ее окулист, друг ее родителей Ричард, который старше её на более чем 20 лет. Джо получает одну из главных ролей в популярном телесериале. Теперь он финансово независим и решает съехать от Чендлера. Тот в свою очередь находит себе нового соседа. Фиби находит своего отца и хочет с ним познакомиться."
        img={
          "https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
        }
        title="Friends"
        subtitle={"Season 2"}
        ratings={2.5}
      />
      <div
        className="w-full py-4 place-items-center justify-center items-center auto-rows-auto gap-5 grid"
        style={cols}
      >
        <EpisodeCard
          img="https://images.unsplash.com/photo-1607748851687-ba9a10438621?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
          title="Pilot"
          episode={1}
          href={"sad/sd"}
        />
      </div>
    </div>
  );
};

export default Season;
