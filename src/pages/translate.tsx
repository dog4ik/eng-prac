import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import Head from "next/head";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiHeart } from "react-icons/fi";
import Layout from "../components/Layout";
import { LikedWordsContext } from "../context/LikedWordsProvider";
import { UserContext } from "../context/UserProvider";
import useDebounce from "../utils/useDebounce";

const Translate = () => {
  const like = useContext(LikedWordsContext);
  const [isLiked, setIsLiked] = useState<boolean>();
  const user = useContext(UserContext);
  const input = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  let likes = like.likesQuery.data?.data;
  useEffect(() => {
    input.current?.focus();
  }, []);
  const likeMutation = useMutation(
    (word: { eng?: string; rus?: string }) => {
      return user.authApi!.post("/wordbooks/words/likes", word);
    },
    {
      onSuccess() {
        setIsLiked(true);
      },
      async onSettled() {
        await queryClient.invalidateQueries(["get-likes"]);
      },
    }
  );
  const delikeMutation = useMutation(
    (word: { eng?: string }) => {
      return user.authApi!.delete("/wordbooks/words/likes", { data: word });
    },
    {
      onSuccess() {
        setIsLiked(false);
      },
      async onSettled() {
        await queryClient.invalidateQueries(["get-likes"]);
      },
    }
  );
  const translateMutation = useMutation(
    (word: { text: string | undefined }) => {
      return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", word);
    }
  );
  useEffect(() => {
    translateMutation.mutate({ text: input.current?.value });
    if (
      likes?.find((item) => item.eng === debouncedSearch)?.eng ===
      debouncedSearch
    ) {
      setIsLiked(true);
    } else {
      setIsLiked(false);
    }
  }, [debouncedSearch]);

  return (
    <>
      <Head>
        <title>Translate</title>
      </Head>
      <div className="flex flex-col gap-5 items-center">
        <div className="w-full flex justify-center items-center">
          <div className="w-2/3">
            <div className="w-full  px-5 py-2 border bg-white text-black rounded-xl flex flex-1 justify-center">
              <div className=" w-full h-32 border-r-2">
                <textarea
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                  ref={input}
                  maxLength={120}
                  className="resize-none bg-white w-full h-full outline-none"
                ></textarea>
              </div>
              <div className=" w-full">
                <div className="resize-none w-full h-full outline-none bg-white relative ">
                  {translateMutation.isSuccess ? (
                    <span>
                      {translateMutation.data?.data.translations[0].text}
                    </span>
                  ) : null}
                  <div className="absolute inline right-0 top-0">
                    <FiHeart
                      onClick={() => {
                        isLiked
                          ? delikeMutation.mutate({ eng: input.current?.value })
                          : likeMutation.mutate({
                              eng: input.current?.value,
                              rus: translateMutation.data?.data.translations[0]
                                .text,
                            });
                      }}
                      className={
                        isLiked
                          ? "self-center cursor-pointer duration-100 fill-pink-500 hover:fill-pink-400 stroke-pink-500 hover:stroke-pink-400"
                          : "self-center cursor-pointer duration-100 stroke-gray-400 hover:stroke-gray-600"
                      }
                      size={35}
                    ></FiHeart>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Translate;
