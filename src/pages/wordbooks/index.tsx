import { useMutation, useQueryClient } from "@tanstack/react-query";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import { FiHeart, FiPlusCircle } from "react-icons/fi";
import Error from "../../components/ui/Error";
import Loading from "../../components/ui/Loading";
import authApi from "../../utils/authApi";
import { useAllWordbooks } from "../../utils/useAllWordbooks";
import { useLikes } from "../../utils/useLikes";
import { Book } from "../../utils/useWordbook";
interface Props extends Book {
  likes?: number;
}
const WordBook = ({ name, words, id, likes, _count }: Props) => {
  const lovedPercent = Math.round(
    (100 * likes!) / (_count?.words ? _count.words : 0)
  );
  return (
    <Link href={`/wordbooks/${encodeURIComponent(id)}`}>
      <div className="animate-fade-in h-full w-full px-3 group rounded-2xl dark:bg-neutral-700 aspect-video overflow-hidden hover:dark:bg-neutral-600 cursor-pointer duration-100 relative">
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
          <p className="">{_count.words}</p>
        </div>
      </div>
    </Link>
  );
};

const Wordbooks = () => {
  const like = useLikes();
  const queryClient = useQueryClient();
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
  if (wordbooks.data === null)
    return (
      <>
        <Head>
          <title>Login to view this page</title>
        </Head>
        <div>Not logged in</div>
      </>
    );
  if (wordbooks.isLoading || like.isLoading)
    return (
      <>
        <Head>
          <title>Loading...</title>
        </Head>
        <Loading />
      </>
    );
  if (wordbooks.isError) return <Error />;
  return (
    <>
      <Head>
        <title>Wordbooks</title>
      </Head>

      <>
        <div className="px-5 md:px-20 flex w-full">
          <div className="flex justify-center items-center flex-col w-full">
            <div className="w-full">
              <h1 className="text-4xl">Wordbooks</h1>
            </div>
            <div className="w-full self-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 auto-cols-max">
              <Link href={"/wordbooks/liked"}>
                <div className="group animate-fade-in h-full w-full rounded-2xl aspect-video hover:bg-pink-600 hover:from-pink-400 bg-gradient-to-t bg-pink-700 from-pink-500 duration-100 cursor-pointer flex justify-center items-center">
                  <FiHeart className="w-1/3 h-full stroke-neutral-400 duration-100 group-hover:stroke-white" />
                </div>
              </Link>
              {wordbooks?.data?.map((item) => (
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
                  words={item.words}
                  private={item.private}
                  _count={item._count}
                ></WordBook>
              ))}

              <div
                className="group animate-fade-in relative h-full w-full rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100 flex justify-center items-center"
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
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Wordbooks;
