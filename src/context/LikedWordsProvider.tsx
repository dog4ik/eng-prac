import React, { createContext, ReactNode, useContext, useState } from "react";
import Papa from "papaparse";
import {
  Query,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { UserContext } from "./UserProvider";

type Props = {
  children: ReactNode;
};
export type Word = {
  eng: string;
  rus: string;
  date: string;
};
export type Book = {
  id: string;
  name: string;
  description?: string;
  words?: Array<Word>;
};

type LikedWordsContext = {
  likesQuery: UseQueryResult<AxiosResponse<Word[], any>, Error>;
};
export const LikedWordsContext = createContext({} as LikedWordsContext);
const LikedWordsProvider = ({ children }: Props) => {
  const queryClient = useQueryClient();
  const user = useContext(UserContext);
  const likesQuery = useQuery<AxiosResponse<Word[]>, Error>(
    ["get-likes"],
    () => user.authApi!.get("/wordbooks/words/likes"),
    {
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        console.log("words", data.data);
      },
    }
  );

  return (
    <LikedWordsContext.Provider value={{ likesQuery }}>
      {children}
    </LikedWordsContext.Provider>
  );
};
export default LikedWordsProvider;
