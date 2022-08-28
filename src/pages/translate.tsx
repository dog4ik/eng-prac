import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { ReactElement, useEffect, useRef, useState } from "react";
import { FiHeart } from "react-icons/fi";
import Layout from "../components/Layout";
import useDebounce from "../utils/useDebounce";

const Translate = () => {
  const input = useRef<HTMLTextAreaElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 1000);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const query = useQuery(["getTranslation"], getTranslation, {
    enabled: false,
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    console.log("fetched");

    query.refetch();
  }, [debouncedSearch]);
  async function getTranslation() {
    return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", {
      text: input.current?.value,
      target: "ru",
      source: "en",
    });
  }
  const handleClick = () => {
    query.refetch();
  };

  return (
    <div className="flex flex-col gap-5 items-center">
      <div className="w-full flex justify-center items-center">
        <div className="w-2/3">
          <div className="w-full px-5 py-2 border bg-white text-black rounded-xl flex flex-1 justify-center">
            <div className=" w-full border-r-2">
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
              <div className="resize-none w-full h-full outline-none bg-white ">
                {query.isSuccess && query.isFetching == false ? (
                  <span>{query.data?.data.translations[0].text}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-5">
        <FiHeart
          className="self-center stroke-gray-300 hover:stroke-white duration-100"
          size={25}
        ></FiHeart>
      </div>
    </div>
  );
};

export default Translate;
