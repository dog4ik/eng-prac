import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Papa from "papaparse";
import {
  ReactElement,
  Ref,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Layout from "../components/Layout";
import { useAllWordbooks } from "../utils/useAllWordbooks";
import { useUser } from "../utils/useUser";
import { Book } from "../utils/useWordbook";
const Card = ({ name, words }: Book) => {
  return (
    <div className=" w-60 rounded-lg items-center flex bg-neutral-700 flex-col cursor-pointer">
      <p>{name}</p>
    </div>
  );
};
const Home = () => {
  const user = useUser();
  const wordbooks = useAllWordbooks();
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className=" h-full w-full overflow-hidden flex-1 dark:text-white relative">
        <div className=" absolute top-0 animate-blob left-0 w-full h-16 bg-purple-600 blur-3xl"></div>
        <div className="w-full h-40 grid gap-5 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid-rows-1 snap-mandatory">
          {wordbooks.data?.map((book) => (
            <Card
              name={book.name}
              key={book.id}
              words={book.words}
              private={book.private}
              id={book.id}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default Home;
