import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import Loading from "../../components/ui/Loading";
import authApi from "../../utils/authApi";
import { useAllWordbooks } from "../../utils/useAllWordbooks";
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
type WordleType = {
  word: string;
  tries: string[];
  maxTries: number;
  id: string;
  userId: string;
  finishDate: Date | null;
  createdAt: Date;
};
const GameRow = ({ word, date, isWin, id }: GameRowProps) => {
  const Status = () => {
    if (!date)
      return <span className="text-white w-1/3 text-end">Ongoing</span>;
    if (isWin)
      return <span className="text-green-500 w-1/3 text-end">Win</span>;
    if (!isWin)
      return <span className="text-red-500 w-1/3 text-end">Lose</span>;
    return null;
  };
  const calculate = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime();
    if (Math.floor(diff / 1000) < 60) return Math.floor(diff / 1000) + "s ago";
    if (Math.floor(diff / (1000 * 60)) < 60)
      return Math.floor(diff / (1000 * 60)) + "m ago";
    if (Math.floor(diff / (1000 * 60 * 60)) < 24)
      return Math.floor(diff / (1000 * 60 * 60)) + "h ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 30)
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + "d ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) > 30)
      return new Date(date).toLocaleDateString();
  };
  const dateFrom = date ? calculate(date) : Date();
  return (
    <Link href={"/wordle/game/" + id}>
      <div className="w-80 bg-neutral-600 hover:bg-neutral-500 transition duration-150 rounded-xl flex items-center px-5 py-4 cursor-pointer">
        <span className="text-white w-1/3 text-end">
          {date ? dateFrom : ""}
        </span>
        <span className="text-white w-1/3 text-end">{date ? word : "???"}</span>
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
      } flex transition duration-150 items-center justify-between cursor-pointer`}
    >
      <span className="text-sm">{title}</span>
      <span className="text-sm">{`${wordsAmount} words`}</span>
    </div>
  );
};
const Index = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const createWordleMutation = useMutation(
    (data: {
      maxTries: number;
      sourceList: string[];
    }): Promise<{
      word: string;
      tries: string[];
      maxTries: number;
      id: string;
    }> => authApi.post("wordle", data).then((data) => data.data),
    {
      onSettled(data, error, variables, context) {
        queryClient.invalidateQueries(["all-wordles"]);
      },
      onSuccess(data, variables, context) {
        router.push("/wordle/game/" + data.id);
      },
    }
  );
  const getAllWordlesQuery = useQuery<AxiosResponse<WordleType[]>, AxiosError>(
    ["all-wordles"],
    () => authApi.get("wordle"),
    {}
  );
  const [maxTries, setMaxTries] = useState(6);
  const [selectedSource, setSelectedSource] = useState<string[]>([]);
  const wordbooksQuery = useAllWordbooks();
  if (getAllWordlesQuery.isLoading || wordbooksQuery.isLoading)
    return <Loading />;
  if (getAllWordlesQuery.isSuccess && wordbooksQuery.isSuccess)
    return (
      <div className="mt-10 flex gap-10 flex-col mx-5 md:mx-20 justify-center items-center">
        <span className="text-2xl">Choose WordLists:</span>
        <div className="w-72 rounded-xl max-h-96 overflow-y-auto scrollbar-thumb-rounded-sm">
          {wordbooksQuery.data.map((item) => (
            <WordbookRow
              id={item.id}
              title={item.name}
              wordsAmount={
                item.words.filter(
                  (item) => item.eng.length > 3 && item.eng.length < 6
                ).length
              }
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
            createWordleMutation.mutate({
              maxTries,
              sourceList: selectedSource,
            });
          }}
        >
          <div className="flex flex-col gap-5 items-center">
            <label htmlFor="tries">Tries Amount:</label>
            <input
              required
              className="text-black rounded-full p-2 outline-none"
              type="number"
              name="tries amount"
              id="tries"
              value={maxTries}
              onChange={(e) => setMaxTries(e.target.valueAsNumber)}
            />
            <button
              className="px-4 py-2 rounded-xl bg-white text-black"
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
          {getAllWordlesQuery.data.data.map((wordle) => (
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
