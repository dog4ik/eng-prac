import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import Head from "next/head";
import Link from "next/link";
import React, { useContext } from "react";
import Loading from "../../components/ui/Loading";
import { Book } from "../../context/LikedWordsProvider";
import { UserContext } from "../../context/UserProvider";

const Learning = () => {
  const user = useContext(UserContext);
  const query = useQuery<AxiosResponse<Book[]>>(["get-wordbooks"], () =>
    user.authApi!.get("/wordbooks")
  );
  const WordBook = ({ name, words, id }: Book) => {
    return (
      <Link href={`/learn/${encodeURIComponent(id)}`}>
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
  if (query.isLoading) return <Loading />;
  return (
    <>
      <Head>
        <title>Learn</title>
      </Head>

      <>
        <div className="flex w-full">
          <div className="flex justify-center items-center flex-col w-full">
            <div className="w-full">
              <h1 className="text-4xl">Select Wordbooks</h1>
            </div>
            <div className="w-full self-center grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-5 auto-cols-max">
              {query.data?.data.map((item) => (
                <WordBook
                  key={item.id}
                  name={item.name}
                  id={item.id}
                  words={item.words}
                ></WordBook>
              ))}
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Learning;
