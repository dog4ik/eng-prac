"use server";
import { tryGetUserId } from "../../getUserId";
import prisma from "../../../../../prisma/PrismaClient";
import { revalidatePath } from "next/cache";
import { authMutation } from "../../utils/authAction";

export async function removeHistoryEntryAction(id: string) {
  let userId = tryGetUserId();
  const count = await prisma.watchHistory.deleteMany({
    where: { id, user_id: userId },
  });
  return count.count;
}

export async function clearHistoryAction() {
  let userId = tryGetUserId();
  await prisma.watchHistory.deleteMany({ where: { user_id: userId } });
}

export async function updateHistoryAction(args: {
  episodeId: string;
  time: number;
  isFinished: boolean;
}) {
  let userId = tryGetUserId();
  let { isFinished, time, episodeId } = args;
  const history = await prisma.watchHistory.findFirst({
    where: { user_id: userId, episode_id: episodeId },
  });
  if (!history) {
    await prisma.watchHistory.create({
      data: {
        user_id: userId,
        episode_id: episodeId,
        time,
        is_finished: isFinished,
      },
    });
  } else {
    await prisma.watchHistory.update({
      where: { id: history.id },
      data: { time, is_finished: isFinished },
    });
  }
}

async function markWatched(episodeId: string, isWatched: boolean) {
  let userId = tryGetUserId();
  const item = await prisma.watchHistory.findFirst({
    where: { user_id: userId, episode_id: episodeId },
  });
  if (item) {
    if (isWatched) {
      await prisma.watchHistory.update({
        where: { id: item.id },
        data: { time: 0, is_finished: isWatched },
      });
    } else {
      await prisma.watchHistory.delete({ where: { id: item.id } });
    }
  } else {
    if (isWatched)
      await prisma.watchHistory.create({
        data: {
          is_finished: true,
          episode_id: episodeId,
          time: 0,
          user_id: userId,
        },
      });
  }
  revalidatePath("/theater/");
}

export async function markWatchedAction(id: string, isWatched: boolean) {
  return authMutation(markWatched(id, isWatched))();
}

export async function getHistoryForEpisodes(episodesIds: string[]) {
  let userId = tryGetUserId();
  let history = await prisma.watchHistory.findMany({
    where: { episode_id: { in: episodesIds }, user_id: userId },
    select: {
      episode_id: true,
      id: true,
      time: true,
      is_finished: true,
    },
  });
  return history;
}
