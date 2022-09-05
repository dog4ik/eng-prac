import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import { useContext, useEffect, useState, useRef } from "react";
import { FiHeart } from "react-icons/fi";
import Loading from "../../components/ui/Loading";
import {
  Book,
  LikedWordsContext,
  Word,
} from "../../context/LikedWordsProvider";
import { UserContext } from "../../context/UserProvider";
import useToggle from "../../utils/useToggle";

interface Props extends Word {
  isLiked: boolean;
  index: number;
}
const Liked = () => {
  const queryClient = useQueryClient();
  const like = useContext(LikedWordsContext);
  const user = useContext(UserContext);
  const delikeMutation = useMutation(
    (word: { eng?: string }) => {
      return user.authApi!.delete("/wordbooks/words/likes", { data: word });
    },
    {
      async onSettled() {
        await queryClient.invalidateQueries(["get-likes"]);
      },
    }
  );
  const Item = ({ rus, eng, date, index, isLiked }: Props) => {
    const calculate = (date: string) => {
      const diff = Date.now() - new Date(date).getTime();
      if (Math.floor(diff / 1000) < 60)
        return Math.floor(diff / 1000) + "s ago";
      if (Math.floor(diff / (1000 * 60)) < 60)
        return Math.floor(diff / (1000 * 60)) + "m ago";
      if (Math.floor(diff / (1000 * 60 * 60)) < 24)
        return Math.floor(diff / (1000 * 60 * 60)) + "h ago";
      if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 30)
        return Math.floor(diff / (1000 * 60 * 60 * 24)) + "d ago";
      if (Math.floor(diff / (1000 * 60 * 60 * 24)) > 30)
        return new Date(date).toLocaleDateString();
    };

    const createdAt = calculate(date.toString());
    const handleLike = () => {
      if (isLiked) {
        delikeMutation.mutate({ eng: eng });
      } else {
      }
    };
    return (
      <div className="w-full h-16 rounded-md hover:bg-neutral-700">
        <div className="w-full h-16 flex px-2">
          <div className="flex w-1/12 items-center">
            <p className="text-2xl">{index}</p>
          </div>
          <div className="flex w-4/12 items-center">
            <p className="text-2xl truncate">{rus}</p>
          </div>
          <div className="flex w-4/12 items-center">
            <p className="text-2xl truncate">{eng}</p>
          </div>
          <div className="flex w-2/12 items-center">
            <p className="text-2xl truncate">{createdAt}</p>
          </div>
          <div className="flex w-1/12 gap-5 justify-end items-center">
            <FiHeart
              onClick={() => {
                handleLike();
              }}
              size={27}
              className={
                isLiked
                  ? "self-center cursor-pointer duration-100 fill-pink-500 hover:fill-pink-400 stroke-pink-500 hover:stroke-pink-400"
                  : "self-center cursor-pointer duration-100 stroke-gray-300 hover:stroke-white"
              }
            ></FiHeart>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <Head>
        <title>
          {like.likesQuery.isSuccess ? "Liked words" : "Loading..."}
        </title>
      </Head>

      {like.likesQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="w-full">
          <div className="flex flex-col py-5 gap-10">
            <div className="flex gap-5">
              <img
                src="https://via.placeholder.com/300"
                alt="placeholder"
                className="aspect-square drop-shadow-2xl shadow-xl object-cover h-52 object-center"
              />
              <div className="flex flex-col justify-between">
                <span className="uppercase text-xs">wordbook</span>
                <h1 className="text-6xl font-semibold">Liked words</h1>

                <p>{like.likesQuery.data?.data.length + " words"}</p>
              </div>
            </div>
            <div className="">
              <div className="w-full h-16 flex px-2">
                <div className="flex w-1/12 items-center">
                  <p className="font-extrabold text-md">#</p>
                </div>
                <div className="flex w-4/12 items-center">
                  <p className="font-extrabold text-md">Russian</p>
                </div>
                <div className="flex w-4/12 items-center">
                  <p className="font-extrabold text-md">English</p>
                </div>
                <div className="flex w-2/12 items-center">
                  <p className="font-extrabold text-md">Addded</p>
                </div>
              </div>
              {like.likesQuery.data?.data?.map((item, index) => (
                <Item
                  key={index}
                  isLiked={
                    like.likesQuery.data?.data?.find(
                      (like) => like.eng === item.eng
                    )?.eng === item.eng
                      ? true
                      : false
                  }
                  index={index + 1}
                  eng={item.eng}
                  rus={item.rus}
                  date={item.date}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Liked;
