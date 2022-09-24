import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import Head from "next/head";
import React, { useContext } from "react";
import Loading from "../../components/ui/Loading";
import { useAllWordbooks } from "../../utils/useAllWordbooks";
import { useUser } from "../../utils/useUser";

const Learning = () => {
  const user = useUser();
  const query = useAllWordbooks();

  if (query.isLoading) return <Loading />;
  return (
    <>
      <Head>
        <title>Learn</title>
      </Head>

      <div className="flex px-5 md:px-20 flex-col flex-1 items-center">
        <div>
          <span className="text-2xl">Pick mode</span>
        </div>
        <div className="w-full h-full flex-1 bg-red-500"></div>
      </div>
    </>
  );
};

export default Learning;
