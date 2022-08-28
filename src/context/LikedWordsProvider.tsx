import React, { createContext, ReactNode, useContext, useState } from "react";
import Papa from "papaparse";
import { Query, useQuery, UseQueryResult } from "@tanstack/react-query";
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
  source?: string;
  target?: string;
  words?: Array<Word>;
  category?: "liked" | "learned" | "any";
};

type LikedWordsContext = {
  query: UseQueryResult<AxiosResponse<Book[], any>, Error>;
  books: Book[] | undefined;
};
export const LikedWordsContext = createContext({} as LikedWordsContext);
const LikedWordsProvider = ({ children }: Props) => {
  const user = useContext(UserContext);
  const [words, setWords] = useState<Word[]>();
  const [books, setBooks] = useState<Book[]>();
  const [name, setName] = useState();
  const query = useQuery<AxiosResponse<Array<Book>>, Error>(
    ["wordbook"],
    getLikes,
    {
      enabled: true,
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setBooks(data.data);
      },
      onError(err) {},
    }
  );
  async function getLikes() {
    return user.authApi!.get("/wordbooks");
  }
  return (
    <LikedWordsContext.Provider value={{ query, books }}>
      {children}
    </LikedWordsContext.Provider>
  );

  // function RandomWord() {
  //   let random = Math.floor(Math.random() * words.length);
  //   let eng;
  //   let rus;
  //   if (
  //     words[random][0].toString() === "English" &&
  //     words[random][1].toString() === "Russian"
  //   ) {
  //     eng = words[random][2].toString();
  //     rus = words[random][3].toString();
  //   }
  //   if (
  //     words[random][0].toString() === "Russian" &&
  //     words[random][1].toString() === "English"
  //   ) {
  //     eng = words[random][3].toString();
  //     rus = words[random][2].toString();
  //   }
  //   return { russian: rus, english: eng };
  // }
};
export default LikedWordsProvider;
