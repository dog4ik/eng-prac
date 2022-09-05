import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiHeart, FiPlusCircle } from "react-icons/fi";
import Loading from "../../components/ui/Loading";
import { Book, LikedWordsContext } from "../../context/LikedWordsProvider";
import { UserContext } from "../../context/UserProvider";
import useToggle from "../../utils/useToggle";

const WordBook = ({ name, words, id }: Book) => {
  return (
    <Link href={`/wordbooks/${encodeURIComponent(id)}`}>
      <div className=" h-full w-full px-10 rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100 ">
        <div className="self-center text-2xl truncate">{name}</div>
        <div className="flex justify-between">
          <p className="pr-2">Words:</p>
          <p>{words?.length ? words.length : 0}</p>
        </div>
        <div className="flex justify-between">
          <p className="pr-2 truncate">Learned words:</p>
          <p>?</p>
        </div>
      </div>
    </Link>
  );
};

const Wordbooks = () => {
  const likedwords = useContext(LikedWordsContext);
  const user = useContext(UserContext);
  const queryClient = useQueryClient();
  const createMutaion = useMutation(
    (book: { name: string }) => {
      return user.authApi!.post("/wordbooks", book);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["get-wordbooks"]);
      },
    }
  );
  const query = useQuery<AxiosResponse<Array<Book>>, Error>(
    ["get-wordbooks"],
    () => user.authApi!.get("/wordbooks")
  );
  if (query.isLoading)
    return (
      <>
        <Head>
          <title>Loading...</title>
        </Head>
        <Loading />
      </>
    );
  return (
    <>
      <Head>
        <title>Wordbooks</title>
      </Head>

      <>
        <div className="flex w-full">
          <div className="flex justify-center items-center flex-col w-full">
            <div className="w-full">
              <h1 className="text-4xl">Wordbooks</h1>
            </div>
            <div className="w-full self-center grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 auto-cols-max">
              <Link href={"/wordbooks/liked"}>
                <div className="group h-full w-full rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100 flex justify-center items-center">
                  <FiHeart className="w-1/3 h-full stroke-neutral-400 duration-100 group-hover:stroke-white" />
                </div>
              </Link>
              {query.data?.data.map((item) => (
                <WordBook
                  key={item.id}
                  name={item.name}
                  id={item.id}
                  words={item.words}
                ></WordBook>
              ))}

              <div
                className="group h-full w-full rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100 flex justify-center items-center"
                onClick={() =>
                  createMutaion.mutate({
                    name: "My Wordbook #" + (query.data!.data.length + 1),
                  })
                }
              >
                <FiPlusCircle className="w-1/3 h-full stroke-neutral-400 duration-100 group-hover:stroke-white" />
              </div>
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Wordbooks;
