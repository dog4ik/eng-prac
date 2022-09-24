import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Papa from "papaparse";
import {
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Layout from "../components/Layout";
import { useUser } from "../utils/useUser";

const Home = () => {
  const user = useUser();

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="dark:bg-neutral-800 dark:text-white items-center">
        <h1 className="md:text-5xl">
          Welcome {user.data?.email ? user.data.email : "Guest"}
        </h1>
        <div className="grid grid-cols-4 w-full gap-10"></div>
      </div>
    </>
  );
};

export default Home;
