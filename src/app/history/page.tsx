import { FiClock } from "react-icons/fi";
import HistoryList from "./HistoryList";
import prisma from "../../../prisma/PrismaClient";
import ClearHistoryButton from "./ClearHistoryButton";
import { getUserIdWithRefresh } from "../lib/getUserId";

async function getHistory(l?: number, cursor?: string) {
  let userId = await getUserIdWithRefresh();
  const limit = l ?? 20;
  const history = await prisma.watchHistory.findMany({
    take: limit + 1,
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      time: true,
      isFinished: true,
      updatedAt: true,
      id: true,
      Episode: {
        select: {
          title: true,
          duration: true,
          poster: true,
          blurData: true,
          number: true,
          plot: true,
          id: true,
          Season: { select: { number: true, showsId: true } },
        },
      },
    },
  });
  let nextCursor: typeof cursor = undefined;
  if (history.length > limit) {
    const nextItem = history.pop();
    nextCursor = nextItem!.id;
  }
  return {
    history,
    nextCursor,
  };
}

export type HistoryType = Awaited<ReturnType<typeof getHistory>>["history"];

async function History() {
  let history = await getHistory();
  return (
    <>
      <div className="flex h-full w-full flex-col-reverse  md:flex-row">
        <div className="md:w-2/3">
          <div className="flex items-center gap-1">
            <div className="flex items-center justify-center">
              <FiClock size={35} />
            </div>
            <span className="p-2 text-2xl font-semibold">History</span>
          </div>
          <HistoryList history={history.history} />
        </div>
        <div className="md:w-1/3">
          <span className="p-2 text-2xl font-semibold">Options</span>
          <ClearHistoryButton />
        </div>
      </div>
    </>
  );
}

export default History;
