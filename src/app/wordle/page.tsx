import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Loading from "../../components/ui/Loading";
import { trpc } from "../../utils/trpc";
import { z } from "zod";
type GameRowProps = {
  word: string;
  date: Date | null;
  id: string;
  isWin: boolean;
};
type WordbookRowProps = {
  title: string;
  wordsAmount: number;
  id: string;
  isSelected: boolean;
  onClick: (id: string) => void;
};
const GameRow = ({ word, date, isWin, id }: GameRowProps) => {
  const Status = () => {
    if (!date)
      return <span className="w-1/3 text-end text-white">Ongoing</span>;
    if (isWin)
      return <span className="w-1/3 text-end text-green-500">Win</span>;
    if (!isWin)
      return <span className="w-1/3 text-end text-red-500">Lose</span>;
    return null;
  };

  return (
    <Link href={"/wordle/game/" + id}>
      <div className="flex w-80 cursor-pointer items-center rounded-xl bg-neutral-600 px-5 py-4 transition duration-150 hover:bg-neutral-500">
        <span className="w-1/3 text-end text-white">
          {date ? date.toLocaleDateString() : ""}
        </span>
        <span className="w-1/3 text-end text-white">{date ? word : "???"}</span>
        <Status />
      </div>
    </Link>
  );
};
const WordbookRow = ({
  title,
  wordsAmount,
  onClick,
  id,
  isSelected,
}: WordbookRowProps) => {
  return (
    <div
      onClick={() => onClick(id)}
      className={`w-full p-2 ${
        isSelected
          ? "bg-neutral-500 hover:bg-neutral-500"
          : "bg-neutral-700 hover:bg-neutral-600"
      } flex cursor-pointer items-center justify-between transition duration-150`}
    >
      <span className="text-sm">{title}</span>
      <span className="text-sm">{`${wordsAmount} words`}</span>
    </div>
  );
};
const Index = () => {
  const queryClient = trpc.useContext();
  const router = useRouter();
  const createWordleMutation = trpc.wordle.createGame.useMutation({
    onSettled() {
      queryClient.wordle.getGames.invalidate();
    },
    async onSuccess(data) {
      await router.push("/wordle/game/" + data.id);
    },
  });
  const getAllWordlesQuery = trpc.wordle.getGames.useQuery();
  const [maxTries, setMaxTries] = useState(6);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const wordbooksQuery = trpc.wordle.getAvailableWordbooks.useQuery();

  const createGame = () => {
    if (createWordleMutation.isLoading || createWordleMutation.isSuccess)
      return;
    const validatedTries = z.number().min(1).max(10).safeParse(maxTries);
    if (!validatedTries.success) return;
    createWordleMutation.mutate({
      sourceList: selectedSource,
      maxTries: validatedTries.data,
    });
  };

  if (getAllWordlesQuery.isLoading || wordbooksQuery.isLoading)
    return <Loading />;
  if (getAllWordlesQuery.isSuccess && wordbooksQuery.isSuccess)
    //TODO: handle state mess
    return (
      <div className="mx-5 mt-10 flex flex-col items-center justify-center gap-10 md:mx-20">
        <span className="text-2xl">Choose WordLists:</span>
        <div className="max-h-96 w-72 overflow-y-auto rounded-xl scrollbar-thumb-rounded-sm">
          {wordbooksQuery.data.map((item) => (
            <WordbookRow
              id={item.id}
              title={item.name}
              wordsAmount={item._count.words}
              key={item.id}
              onClick={(id) =>
                selectedSource.includes(id)
                  ? setSelectedSource(
                      selectedSource.filter((item) => item != id)
                    )
                  : setSelectedSource([...selectedSource, id])
              }
              isSelected={selectedSource.includes(item.id)}
            />
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createGame();
          }}
        >
          <div className="flex flex-col items-center gap-5">
            <label htmlFor="tries">Tries Amount:</label>
            <input
              required
              className="rounded-full p-2 text-black outline-none"
              type="number"
              min={1}
              max={10}
              name="tries amount"
              id="tries"
              value={maxTries}
              onChange={(e) => setMaxTries(e.target.valueAsNumber)}
            />
            <button
              className="rounded-xl bg-white px-4 py-2 text-black"
              type="submit"
            >
              Create
            </button>
            <div className="h-5">
              {createWordleMutation.isError && (
                <span className="text-red-500 ">No words selected</span>
              )}
            </div>
          </div>
        </form>
        <div className="flex flex-col gap-5">
          {getAllWordlesQuery.data.map((wordle) => (
            <GameRow
              key={wordle.id}
              word={wordle.word}
              date={wordle.finishDate}
              id={wordle.id}
              isWin={wordle.tries.includes(wordle.word)}
            />
          ))}
        </div>
      </div>
    );
};

export default Index;
