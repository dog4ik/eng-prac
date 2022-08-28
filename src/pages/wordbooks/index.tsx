import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import React, { useContext } from "react";
import { Book, LikedWordsContext } from "../../context/LikedWordsProvider";
import { UserContext } from "../../context/UserProvider";

const WordBook = ({ name, source, target, words, category, id }: Book) => {
  return (
    <Link href={`/wordbooks/${encodeURIComponent(id)}`}>
      <div className=" px-10 rounded-2xl dark:bg-neutral-700 aspect-video hover:dark:bg-neutral-600 cursor-pointer duration-100  flex flex-col gap-3">
        <div className="self-center text-2xl">{name}</div>
        <div className="flex justify-between">
          <p className="pr-2">Words:</p>
          <p>{words?.length ? words.length : 0}</p>
        </div>
        <div className="flex justify-between">
          <p className="pr-2">Learned words:</p>
          <p>?</p>
        </div>
        <div className="flex justify-between">
          <p className="pr-2">Cathegory</p>
          <p>{category ? category : "Any"}</p>
        </div>
      </div>
    </Link>
  );
};
const Wordbooks = () => {
  const likedwords = useContext(LikedWordsContext);
  const user = useContext(UserContext);
  async function getBooks() {
    return user.authApi!.get("/wordbooks");
  }
  const query = useQuery<AxiosResponse<Array<Book>>, Error>(
    ["wordbook"],
    getBooks,
    {
      enabled: true,
      retry: false,
      refetchOnWindowFocus: true,
      onSuccess(data) {
        console.log(data.data);
      },
      onError(err) {},
    }
  );
  return (
    <>
      <Head>
        <title>Wordbooks</title>
      </Head>
      <div className="flex w-full">
        <div className="flex flex-col w-full">
          <div className="w-full">
            <h1 className="text-4xl">My Wordbooks </h1>
          </div>
          <div className="w-full self-center grid grid-cols-4 gap-5">
            {query.data?.data.map((item) => (
              <WordBook
                key={item.id}
                name={item.name}
                id={item.id}
                words={item.words}
                category={item.category}
              ></WordBook>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Wordbooks;
