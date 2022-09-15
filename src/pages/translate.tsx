import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiHeart } from "react-icons/fi";
import Layout from "../components/Layout";
import { LikedWordsContext, Word } from "../context/LikedWordsProvider";
import { UserContext } from "../context/UserProvider";
import useDebounce from "../utils/useDebounce";
export const getServerSideProps: GetServerSideProps<{
  text?: string | string[] | null;
}> = async (context) => {
  const text = context.query.text ? context.query.text : null;
  return { props: { text } };
};
const Translate = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const user = useContext(UserContext);
  const input = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  useEffect(() => {
    input.current?.focus();
    if (props.text) input.current!.value = props.text.toString();
  }, []);
  const likesQuery = useQuery<AxiosResponse<Word[]>, Error>(["get-likes"], () =>
    user.authApi!.get("/wordbooks/words/likes")
  );
  const likeMutation = useMutation(
    (word: { eng?: string; rus?: string }) => {
      return user.authApi!.post("/wordbooks/words/likes", word);
    },
    {
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
    router.push("?text=" + input.current?.value);
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
                        likesQuery.data?.data.find(
                          (item) => item.eng == input.current?.value
                        )
                          ? delikeMutation.mutate({ eng: input.current?.value })
                          : likeMutation.mutate({
                              eng: input.current?.value,
                              rus: translateMutation.data?.data.translations[0]
                                .text,
                            });
                      }}
                      className={
                        likesQuery.data?.data.find(
                          (item) => item.eng == input.current?.value
                        )
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
