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
import { UserContext } from "../context/UserProvider";

const Home = () => {
  const user = useContext(UserContext);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="dark:bg-neutral-800 dark:text-white items-center">
        <h1 className="md:text-5xl">
          Welcome {user.user?.email ? user.user.email : "Guest"}
        </h1>
        <div className="grid grid-cols-4 w-full gap-10"></div>
      </div>
    </>
  );
};

export default Home;
