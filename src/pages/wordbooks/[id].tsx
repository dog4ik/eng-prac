import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FiArrowRight, FiHeart, FiPlus, FiTrash2 } from "react-icons/fi";
import Input from "../../components/ui/Input";
import { UserContext } from "../../context/UserProvider";
import {
  Word,
  LikedWordsContext,
  Book,
} from "../../context/LikedWordsProvider";
import useDebounce from "../../utils/useDebounce";
import useToggle from "../../utils/useToggle";
import Loading from "../../components/ui/Loading";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
interface Props extends Word {
  isLiked: boolean;
  index: number;
}
export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
};

const Book = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const queryClient = useQueryClient();
  const like = useContext(LikedWordsContext);
  const user = useContext(UserContext);
  const contextAreaRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useToggle(false);
  const [contextmenu, setContextmenu] = useToggle(false);
  const [selected, setSelected] = useState<number>();
  const Menu = () => {
    return (
      <div
        className="w-60 z-10 bg-neutral-900 fixed rounded-xl overflow-hidden"
        style={{ top: anchorPoint.y, left: anchorPoint.x }}
      >
        <ul className="w-full">
          <li className="h-16 flex items-center pl-2 hover:bg-neutral-700 cursor-pointer">
            <span className="pointer-events-none">Delete</span>
          </li>
        </ul>
      </div>
    );
  };
  useEffect(() => {
    let scroll = window.innerWidth - document.documentElement.clientWidth;
    if (modal == true) {
      document.body.style.overflow = "hidden";
      document.body.style.marginRight = `${scroll}px`;
    } else {
      document.body.style.overflow = "auto";
      document.body.style.marginRight = "unset";
    }
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.marginRight = "unset";
    };
  }, [modal]);

  const query = useQuery<AxiosResponse<Book>, Error>(
    ["wordbook", props.id],
    () => user.authApi!.post("/wordbooks/getone", { id: props.id }),
    {
      refetchOnWindowFocus: false,
      onError(err) {
        console.log(err);
      },
      onSuccess(data) {
        console.log(data.data);
      },
    }
  );

  const deleteMutation = useMutation(
    (word: { word?: string; id?: string | string[] }) => {
      return user.authApi!.delete("/wordbooks/words", { data: word });
    },
    {
      onSettled() {
        queryClient.invalidateQueries(["wordbook", query.data?.data.id]);
      },
    }
  );

  const handleMenu = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (contextAreaRef.current?.contains(target)) {
        e.preventDefault();
        setAnchorPoint({ x: e.pageX, y: e.pageY });
        setContextmenu(true);
        return;
      }
      setContextmenu(false);
    },
    [setAnchorPoint]
  );
  const handleClick = (e: MouseEvent) => {
    setContextmenu(false);
  };
  useEffect(() => {
    document.addEventListener("contextmenu", handleMenu);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("contextmenu", handleMenu);
      document.removeEventListener("click", handleClick);
    };
  }, []);
  const Modal = () => {
    const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
    const [transition, setTranslation] = useState("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const input = useRef<HTMLInputElement>(null);
    const input2 = useRef<HTMLInputElement>(null);
    const debouncedSearch = useDebounce(searchTerm, 2000);
    useEffect(() => {
      input.current?.focus();
    }, []);

    const addMutation = useMutation(
      (word: { eng?: string; rus?: string; id?: string | string[] }) => {
        return user.authApi!.post("wordbooks/words", word);
      },
      {
        async onSettled(data, error, variables, context) {
          setModal(false);
          await queryClient.invalidateQueries([
            "wordbook",
            query.data?.data.id,
          ]);
        },
      }
    );
    const mutation = useMutation(
      (word: { text: string }) => {
        return axios.post(
          process.env.NEXT_PUBLIC_API_LINK + "/translate",
          word
        );
      },
      {
        onSuccess: (data) => {
          setTranslation(data.data.translations[0].text);
        },
      }
    );
    useEffect(() => {
      if (searchTerm && searchTerm.trim() != "")
        mutation.mutate({ text: debouncedSearch });
      else null;
    }, [debouncedSearch]);

    const handleAdd = () => {
      if (option === "Auto") {
        addMutation.mutate({ eng: input.current?.value, id: props.id });
      }
      if (option === "Manual") {
        addMutation.mutate({
          eng: input.current?.value,
          rus: input2.current?.value,
          id: props.id,
        });
      }
      if (option === "Export") {
      }
    };

    return (
      <div
        className="absolute z-20 backdrop-filter backdrop-blur-sm top-0 left-0 w-screen h-screen flex justify-center items-center animate-fade-in transition-opacity duration-500"
        onClick={() => setModal()}
      >
        <div
          className="bg-neutral-700 relative w-2/3 h-2/3 rounded-2xl flex flex-col items-center"
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
                    option === "Manual"
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
                    option === "Export"
                      ? "rounded-2xl cursor-pointer bg-slate-500 basis-1/3 text-center"
                      : "rounded-2xl cursor-pointer basis-1/3 text-center"
                  }
                >
                  Export
                </span>
              </div>
            </div>

            {option === "Auto" ? (
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
                      // onChange={(event) => handleChange(event)}
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
              className="py-5 absolute right-10 bottom-10 px-10 flex justify-center items-center bg-green-400 rounded-xl self-end"
            >
              {addMutation.isLoading ? (
                <>
                  <svg
                    className="animate-spin absolute h-5 w-5 text-white"
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
                </>
              ) : (
                <span className="absolute">Add</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

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

    const createdAt = calculate(date);
    const handleLike = () => {
      if (isLiked) {
      } else {
      }
    };
    return (
      <div
        onClick={() => setSelected(index)}
        className={
          selected == index
            ? "w-full h-16 rounded-md bg-neutral-600  hover:bg-neutral-500"
            : "w-full h-16 rounded-md hover:bg-neutral-700"
        }
      >
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

            <FiTrash2
              onClick={() => deleteMutation.mutate({ word: eng, id: props.id })}
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
      {contextmenu && <Menu />}
      {query.isLoading ? (
        <Loading />
      ) : (
        <div className="w-full">
          <div className="flex flex-col py-5 gap-10">
            <div className="flex gap-5 relative">
              <img
                src="https://via.placeholder.com/300"
                alt="placeholder"
                className="aspect-square drop-shadow-2xl shadow-xl object-cover h-52 object-center"
              />
              <div className="flex flex-col justify-between">
                <span className="uppercase text-xs">wordbook</span>
                <h1 className="text-2xl md:text-6xl font-semibold">
                  {query.data?.data.name}
                </h1>
                {query.data?.data.description ? (
                  <p>{query.data.data.description}</p>
                ) : null}
                <p>{query.data?.data.words?.length + " words"}</p>
              </div>
              <div
                className="absolute right-0 bottom-0 cursor-pointer rounded-full bg-green-500 p-2"
                onClick={() => {
                  setModal();
                }}
              >
                <FiPlus size={40} className="" />
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
                <div className="flex w-1/12 gap-5 justify-end items-center"></div>
              </div>
              <div ref={contextAreaRef}>
                {query.data?.data.words?.map((item, index) => (
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
        </div>
      )}
    </>
  );
};

export default Book;
