import { useMutation, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiHeart, FiPlusCircle } from "react-icons/fi";
import {
  FilterChipBar,
  FilterChipBarItem,
} from "../../components/FilterChipBar";
import Error from "../../components/ui/Error";
import Loading from "../../components/ui/Loading";
import authApi from "../../utils/authApi";
import { useAllWordbooks } from "../../utils/useAllWordbooks";
import useGridCols from "../../utils/useGrid";
import { useLikes } from "../../utils/useLikes";
import { Book } from "../../utils/useWordbook";
interface Props {
  likes?: number;
  count: number;
  name: string;
  id: string;
}

const WordBook = ({ name, id, likes, count }: Props) => {
  const lovedPercent = Math.round((100 * likes!) / count);
  return (
    <Link href={`/wordbooks/${encodeURIComponent(id)}`}>
      <div className="animate-fade-in h-40 w-72 px-3 group rounded-2xl dark:bg-neutral-700 aspect-video overflow-hidden hover:dark:bg-neutral-600 cursor-pointer duration-100 relative">
        <div
          className="w-full absolute bottom-0 left-0 right-0 group-hover:bg-pink-600 group-hover:from-pink-400 bg-gradient-to-t bg-pink-700 from-pink-500 duration-100"
          style={{
            height: `${lovedPercent ? lovedPercent : 0}%`,
            borderRadius:
              lovedPercent === 100 ? "" : "50% 50% 0% 0% / 20% 20% 0% 0% ",
          }}
        >
          <p className="left-1/2 absolute -translate-x-1/2 top-1/2 -translate-y-1/2 text-white/80 text-lg md:text-2xl">
            {lovedPercent >= 33 ? "Liked " + lovedPercent + "%" : ""}
          </p>
        </div>

        <div className="self-center relative flex justify-center items-center text-2xl font-semibold text-center truncate">
          <p title={name} className="truncate">
            {name}
          </p>
        </div>
        <div className="flex relative justify-between">
          <p className="pr-2 ">Words:</p>
          <p className="">{count}</p>
        </div>
      </div>
    </Link>
  );
};

const Wordbooks = () => {
  const like = useLikes();
  const queryClient = useQueryClient();
  const cols = useGridCols(360);
  const createMutaion = useMutation(
    (book: { name: string }) => {
      return authApi!.post("/wordbooks", book);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["get-wordbooks"]);
      },
    }
  );
  const wordbooks = useAllWordbooks();
  const [filteredWordbooks, setFilteredWordbooks] = useState<Book[]>();
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Favorite" | "Collection"
  >("All");
  useEffect(() => {
    if (wordbooks.data) setFilteredWordbooks([...wordbooks.data]);
  }, [wordbooks.isSuccess]);

  const handleFilter = (filter: typeof selectedFilter) => {
    if (filter === "All") {
      return wordbooks.data ? [...wordbooks.data] : [];
    }
    if (filter === "Collection") return;
  };
  if (wordbooks.data === null)
    return (
      <>
        <Head>
          <title>Login to view this page</title>
        </Head>
        <div>Not logged in</div>
      </>
    );
  if (wordbooks.isLoading || like.isLoading) return <Loading />;
  if (wordbooks.isError) return <Error />;
  return (
    <>
      <Head>
        <title>Wordbooks</title>
      </Head>
      <>
        <div className="px-5 md:px-10 flex w-full">
          <div className="flex justify-center items-center flex-col w-full">
            <FilterChipBar>
              <FilterChipBarItem
                title="All"
                isSelected={selectedFilter === "All"}
                onClick={() => setSelectedFilter("All")}
              />
              <FilterChipBarItem
                title="Collection"
                isSelected={selectedFilter === "Collection"}
                onClick={() => setSelectedFilter("Collection")}
              />
              <FilterChipBarItem
                title="Favorite"
                isSelected={selectedFilter === "Favorite"}
                onClick={() => setSelectedFilter("Favorite")}
              />
            </FilterChipBar>

            <div
              className="w-full place-items-center justify-center items-center auto-rows-auto gap-5 grid"
              style={cols}
            >
              {selectedFilter == "All" || selectedFilter == "Favorite" ? (
                <Link href={"/wordbooks/liked"}>
                  <div className="group animate-fade-in h-40 w-72 rounded-2xl aspect-video hover:bg-pink-600 hover:from-pink-400 bg-gradient-to-t bg-pink-700 from-pink-500 duration-100 cursor-pointer flex justify-center items-center">
                    <FiHeart className="w-1/3 h-full stroke-neutral-400 duration-100 group-hover:stroke-white" />
                  </div>
                </Link>
              ) : null}
              {filteredWordbooks?.map((item) => (
                <WordBook
                  key={item.id}
                  name={item.name}
                  likes={item.words?.reduce((amount, word) => {
                    if (
                      like.data?.findIndex((wrd) => wrd.eng == word.eng) != -1
                    )
                      amount = amount + 1;
                    return amount;
                  }, 0)}
                  id={item.id}
                  count={item.words.length}
                ></WordBook>
              ))}

              {selectedFilter == "All" ? (
                <div
                  className="group animate-fade-in relative h-40 w-72 rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100 flex justify-center items-center"
                  onClick={() =>
                    createMutaion.mutate({
                      name: "My Wordbook #" + (wordbooks.data?.length! + 1),
                    })
                  }
                >
                  {createMutaion.isLoading ? (
                    <Loading />
                  ) : (
                    <FiPlusCircle className="w-1/3 h-full stroke-neutral-400 duration-100 group-hover:stroke-white" />
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Wordbooks;
