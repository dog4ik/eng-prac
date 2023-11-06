import { NextRequest } from "next/server";
import prisma from "../../../../../prisma/PrismaClient";

export async function GET(request: NextRequest) {
  let params = request.nextUrl.searchParams;
  let showId = params.get("showid");
  let season = +(params.get("season") ?? NaN);
  if (!showId || isNaN(season))
    return new Response(JSON.stringify({ message: "params are wrong" }), {
      status: 400,
    });
  const episodes = await prisma.season.findFirst({
    where: {
      shows_id: showId,
      number: season,
    },
    select: {
      poster: true,
      blur_data: true,
      number: true,
      plot: true,
      release_date: true,
      episodes: {
        select: {
          poster: true,
          blur_data: true,
          id: true,
          number: true,
          release_date: true,
          external_subs: true,
          duration: true,
          title: true,
          rating: true,
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (!episodes) {
    return new Response(undefined, { status: 404 });
  }

  return {
    poster: episodes.poster,
    blurData: episodes.blur_data,
    number: episodes.number,
    plot: episodes.plot,
    releaseDate: episodes.release_date,
    episodesCount: episodes.episodes.length,
    episodes: episodes.episodes,
  };
}
