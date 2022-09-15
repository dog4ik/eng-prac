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
  private: boolean;
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
  const user = useContext(UserContext);
  const likesQuery = useQuery<AxiosResponse<Word[]>, Error>(
    ["get-likes"],
    () => user.authApi!.get("/wordbooks/words/likes"),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <LikedWordsContext.Provider value={{ likesQuery }}>
      {children}
    </LikedWordsContext.Provider>
  );
};
export default LikedWordsProvider;
