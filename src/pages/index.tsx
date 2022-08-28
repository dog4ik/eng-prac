import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Papa from "papaparse";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import Layout from "../components/Layout";
import { UserContext } from "../context/UserProvider";

const Home = () => {
  const user = useContext(UserContext);
  const Card = () => {
    return (
      <div className="rounded-3xl dark:bg-neutral-700 hover:dark:bg-neutral-600  flex justify-center items-center aspect-video">
        <h2>Progress</h2>
      </div>
    );
  };
  return (
    <div className="flex flex-col dark:bg-neutral-800 dark:text-white items-center">
      <h1 className="text-5xl">
        Welcome {user.user?.email ? user.user.email : "Guest"}
      </h1>
      <div className="grid grid-cols-4 w-full gap-10">
        <Card></Card>
        <Card></Card>
        <Card></Card>
        <Card></Card>
        <Card></Card>
        <Card></Card>
      </div>
    </div>
  );
};

export default Home;
