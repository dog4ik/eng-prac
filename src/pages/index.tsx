import type { NextPage } from "next";
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
import Title from "../components/Title";
import { useAllWordbooks } from "../utils/useAllWordbooks";
import { useUser } from "../utils/useUser";
import { Book } from "../utils/useWordbook";
const Card = ({ name, words }: Book) => {
  return (
    <div className=" flex w-60 cursor-pointer flex-col items-center rounded-lg bg-neutral-700">
      <p>{name}</p>
    </div>
  );
};
const Home = () => {
  const user = useUser();
  const wordbooks = useAllWordbooks();
  return (
    <>
      <Title title="Home" />

      <div className=" relative h-full w-full flex-1 overflow-hidden dark:text-white">
        <div className=" absolute top-0 left-0 h-16 w-full animate-blob bg-purple-600 blur-3xl"></div>
        <div className="grid h-40 w-full snap-mandatory grid-cols-3 grid-rows-1 gap-5 md:grid-cols-4 lg:grid-cols-5"></div>
      </div>
    </>
  );
};

export default Home;
