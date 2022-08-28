import { useQueries, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import { useRouter } from "next/router";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  FiArrowRight,
  FiEdit,
  FiHeart,
  FiPlus,
  FiTrash,
  FiTrash2,
} from "react-icons/fi";
import { v4 } from "uuid";
import Input from "../../components/ui/Input";
import { UserContext } from "../../context/UserProvider";
import {
  Word,
  LikedWordsContext,
  Book,
} from "../../context/LikedWordsProvider";
import useDebounce from "../../utils/useDebounce";
import useToggle from "../../utils/useToggle";
interface Props extends Word {
  index: number;
}
const Book = () => {
  const wordbooks = useContext(LikedWordsContext);
  const user = useContext(UserContext);
  const [modal, setModal] = useToggle(false);
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
  }, [router.isReady]);
  const getOne = () => {
    return user.authApi!.post("/wordbooks/getone", { id: router.query.id });
  };
  const query = useQuery<AxiosResponse<Book>, Error>(["getone"], getOne, {
    enabled: router.isReady,
    refetchOnWindowFocus: false,
    onError(err) {
      console.log(err);
    },
    onSuccess(data) {
      console.log(data.data);
    },
  });
  const Modal = () => {
    const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
    const [transition, setTranslation] = useState("Word");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const input = useRef<HTMLInputElement>(null);
    const input2 = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce(searchTerm, 2000);

    useEffect(() => {
      input.current?.focus();
    }, []);
    const getTranslation = async () => {
      return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", {
        text: input.current?.value,
        target: "ru",
        source: "en",
      });
    };
    const query = useQuery(["getTranslation"], getTranslation, {
      enabled: false,
      retry: false,
      refetchOnWindowFocus: false,
      onSuccess: (data) => {
        setTranslation(data.data.translations[0].text);
      },
    });
    useEffect(() => {
      if (searchTerm && searchTerm.trim() != "") query.refetch();
      else null;
    }, [debouncedSearch]);

    const handleAdd = () => {
      if (option === "Auto") {
        user.authApi?.post("/wordbooks/words", {
          id: router.isReady ? router.query.id : null,
          eng: input.current?.value,
        });
      }
      if (option === "Manual") {
      }
    };
    return (
      <div
        className="absolute top-0 left-0 w-screen h-screen flex justify-center items-center bg-black/60 animate-fade-in transition-opacity duration-500"
        onClick={() => setModal()}
      >
        <div
          className="bg-neutral-700 w-2/3 h-2/3 rounded-2xl flex flex-col items-center"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="w-5/6 h-full flex flex-col">
            <div className="flex flex-col gap-4">
              <h1 className="text-center text-2xl">Add word</h1>
              <div className="bg-gray-400 w-3/4 self-center flex justify-between rounded-2xl overflow-hidden">
                <span
                  onClick={() => {
                    setOption("Auto");
                  }}
                  className={
                    option == "Auto"
                      ? "rounded-2xl cursor-pointer bg-slate-500 basis-1/3 text-center"
                      : "rounded-2xl cursor-pointer basis-1/3 text-center"
                  }
                >
                  Auto
                </span>
                <span
                  onClick={() => {
                    setOption("Manual");
                  }}
                  className={
                    option == "Manual"
                      ? "rounded-2xl cursor-pointer bg-slate-500 basis-1/3 text-center"
                      : "rounded-2xl cursor-pointer basis-1/3 text-center"
                  }
                >
                  Manual
                </span>
                <span
                  onClick={() => {
                    setOption("Export");
                  }}
                  className={
                    option == "Export"
                      ? "rounded-2xl cursor-pointer bg-slate-500 basis-1/3 text-center"
                      : "rounded-2xl cursor-pointer  basis-1/3 text-center"
                  }
                >
                  Export
                </span>
              </div>
            </div>

            {option == "Auto" ? (
              <div className="flex items-center justify-center">
                <Input
                  onChange={(event) => {
                    setSearchTerm(event.currentTarget.value);
                  }}
                  ref={input}
                  label="Word"
                  required={false}
                  type="text"
                  className="text-black"
                />
                <FiArrowRight size={35} />
                <span className="basis-1/3">{transition}</span>
              </div>
            ) : option == "Manual" ? (
              <>
                <div className="flex items-center justify-center">
                  <Input
                    ref={input}
                    label="Eng"
                    required={false}
                    type="text"
                    className="text-black"
                  />
                  <FiArrowRight size={35} />
                  <Input
                    ref={input2}
                    label="Rus"
                    type="text"
                    required={false}
                    className="text-black"
                  />
                </div>
              </>
            ) : option == "Export" ? (
              <>
                <div className=" w-full flex py-10 flex-col items-center justify-between">
                  <label
                    htmlFor="file"
                    className="relative block bg-green-400 rounded-2xl h-60 w-5/6 md:w-2/3 "
                  >
                    <p className="w-5/6 text-center truncate absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none text-xl md:text-2xl text-white font-bold">
                      {"Pick a file"}
                    </p>
                    <input
                      //onChange={(event) => handleChange(event)}
                      type="file"
                      accept=".csv"
                      id="file"
                      className="w-full h-full cursor-pointer opacity-0 file:hidden"
                    />
                  </label>
                </div>
              </>
            ) : null}
            <button
              onClick={() => handleAdd()}
              className="p-2 px-5 bg-green-400 rounded-xl self-end"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    );
  };

  const Loading = () => {
    return (
      <div className="w-full flex justify-center items-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white "
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  };
  const Item = ({ rus, eng, date, index }: Props) => {
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

    const createdAt = calculate(date);

    return (
      <div className="w-full h-16 rounded-md hover:bg-neutral-700">
        <div className="w-full h-16 grid grid-flow-col grid-cols-5 px-2">
          <div className="flex items-center">
            <p className="font-semibold text-2xl">{index}</p>
          </div>
          <div className="flex items-center">
            <p className="font-semibold text-2xl">{rus}</p>
          </div>
          <div className="flex items-center">
            <p className="font-semibold text-2xl">{eng}</p>
          </div>
          <div className="flex items-center">
            <p className="font-semibold text-2xl">{createdAt}</p>
          </div>
          <div className="flex gap-5 justify-end items-center">
            <FiHeart
              size={27}
              className="hover:stroke-pink-500 cursor-pointer duration-200"
            ></FiHeart>
            <FiEdit
              className="hover:stroke-green-500 cursor-pointer duration-200"
              size={27}
            ></FiEdit>
            <FiTrash2
              className="hover:stroke-red-500 cursor-pointer duration-200"
              size={27}
            ></FiTrash2>
          </div>
        </div>
      </div>
    );
  };
  return (
    <>
      <Head>
        <title>
          {query.data?.data?.name ? query.data.data.name : "Loading..."}
        </title>
      </Head>
      {modal && <Modal />}
      <div className="w-full">
        <div className="flex flex-col">
          <div className="flex justify-between">
            <h1 className="text-3xl">{query.data?.data.name}</h1>
            <FiPlus
              onClick={() => {
                setModal();
              }}
              className="hover:stroke-sky-500 cursor-pointer duration-200"
              size={35}
            />
          </div>
          <div className="">
            <div className="w-full h-16 grid grid-flow-col grid-cols-5 px-2">
              {" "}
              <div className="flex items-center">
                <p className="font-extrabold text-md">#</p>
              </div>
              <div className="flex items-center">
                <p className="font-extrabold text-md">Russian</p>
              </div>
              <div className="flex items-center">
                <p className="font-extrabold text-md">English</p>
              </div>
              <div className="flex items-center">
                <p className="font-extrabold text-md">Addded</p>
              </div>
              <div className="flex gap-5 justify-end items-center"></div>
            </div>
            {query.isFetching ? (
              <Loading />
            ) : (
              query.data?.data.words?.map((item, index) => (
                <Item
                  key={v4()}
                  index={index + 1}
                  eng={item.eng}
                  rus={item.rus}
                  date={item.date}
                ></Item>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Book;
