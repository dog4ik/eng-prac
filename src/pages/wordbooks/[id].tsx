import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import Head from "next/head";
import React, {
  CSSProperties,
  MouseEventHandler,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  FiArrowRight,
  FiCamera,
  FiHeart,
  FiImage,
  FiLock,
  FiPlus,
  FiTrash2,
  FiUnlock,
  FiX,
} from "react-icons/fi";
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
import Image from "next/image";
import { useRouter } from "next/router";
import { v4 } from "uuid";
interface Props extends Word {
  isLiked: boolean;
  isSelected: boolean;
  index: number;
  props: InferGetServerSidePropsType<typeof getServerSideProps>;
}
type ModalProps = {
  handleClose: () => void;
  props: InferGetServerSidePropsType<typeof getServerSideProps>;
};

export const getServerSideProps: GetServerSideProps<{
  id?: string | string[];
}> = async (context) => {
  const { id } = context.query;
  return { props: { id } };
};
const EditWordbook = ({ handleClose, props }: ModalProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useQuery<AxiosResponse<Book>, Error>(["wordbook", props.id]);
  const user = useContext(UserContext);
  const [isPrivate, setIsPrivate] = useToggle(query.data!.data.private);
  const nameRef = useRef<HTMLInputElement>(null);
  const deleteMutation = useMutation(
    () => {
      return user.authApi!.delete("wordbooks/" + props.id);
    },
    {
      async onSuccess(data, variables, context) {
        await queryClient.invalidateQueries(["get-wordbooks"]);
        router.replace("/wordbooks");
      },
    }
  );
  const editMutation = useMutation(
    (data: { private: boolean; name: string }) => {
      return user.authApi!.patch("wordbooks/" + props.id, data);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["wordbook", props.id]);
        handleClose();
      },
    }
  );
  return (
    <div
      onClick={(e) => handleClose()}
      className="fixed top-0 left-0 h-screen w-screen backdrop-filter backdrop-blur-sm z-20 flex justify-center items-center animate-fade-in transition-opacity duration-300"
    >
      <div
        className="h-2/3 relative w-1/3 p-5 bg-neutral-600 rounded-2xl flex flex-col "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => handleClose()}
        />
        <p className="text-3xl">Edit wordbook</p>
        <div className="flex w-full flex-col justify-center gap-10">
          <div className="w-1/5 bg-white rounded-md">
            <FiImage className="w-full fill-neutral-600 h-full" />
          </div>
          <div>
            <Input
              label="Name"
              defaultValue={query.data?.data.name}
              ref={nameRef}
            />
            <div className="flex gap-3 items-center">
              <p>Is private?</p>
              <div
                onClick={() => setIsPrivate()}
                className="w-12 h-6 flex bg-white rounded-full cursor-pointer"
              >
                <div
                  className={`h-full flex justify-center items-center rounded-full transition duration-100 bg-green-400 w-1/2 ${
                    isPrivate ? `translate-x-6` : null
                  }`}
                >
                  {isPrivate ? (
                    <FiLock className="stroke-black" />
                  ) : (
                    <FiUnlock className="stroke-black " />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex absolute bottom-10 right-10 gap-5">
          <button
            className="p-2 rounded-xl bg-red-500"
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </button>
          <button
            className="p-2 rounded-xl bg-green-500"
            onClick={() =>
              editMutation.mutate({
                private: isPrivate,
                name: nameRef.current!.value,
              })
            }
          >
            {"Save"}
          </button>
        </div>
      </div>
    </div>
  );
};
const Modal = ({ handleClose, props }: ModalProps) => {
  const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
  const [transition, setTranslation] = useState("");
  const user = useContext(UserContext);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const input = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const fileReader = new FileReader();
  const debouncedSearch = useDebounce(searchTerm, 2000);
  const query = useQuery<AxiosResponse<Book>, Error>(["wordbook", props.id]);
  useEffect(() => {
    input.current?.focus();
  }, []);

  const addMutation = useMutation(
    (word: { eng?: string; rus?: string }) => {
      return user.authApi!.post("wordbooks/words/" + props.id, word);
    },
    {
      async onSettled(data, error, variables, context) {
        handleClose();
        await queryClient.invalidateQueries(["wordbook", query.data?.data.id]);
      },
    }
  );
  const exportMutation = useMutation(
    (file: { file: string | ArrayBuffer | null; id?: string | string[] }) => {
      return user.authApi!.post("wordbooks/words/export", file);
    },
    {
      onSuccess: (data) => {
        handleClose();
        queryClient.invalidateQueries(["wordbook", props.id]);
      },
    }
  );
  const mutation = useMutation(
    (word: { text: string }) => {
      return axios.post(process.env.NEXT_PUBLIC_API_LINK + "/translate", word);
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
      addMutation.mutate({ eng: input.current?.value });
    }
    if (option === "Manual") {
      addMutation.mutate({
        eng: input.current?.value,
        rus: input2.current?.value,
      });
    }
    if (option === "Export") {
      if (!file || file.type != "text/csv") return;
      fileReader.onload = function (event) {
        const csvOutput = event.target!.result;
        exportMutation.mutate({ file: csvOutput, id: props.id });
      };
      fileReader.readAsText(file);
    }
  };

  return (
    <div
      className="fixed z-20 backdrop-filter backdrop-blur-sm top-0 left-0 w-screen h-screen flex justify-center items-center animate-fade-in transition-opacity duration-300"
      onClick={() => handleClose()}
    >
      <div
        className="bg-neutral-700 relative w-2/3 h-2/3 rounded-2xl flex flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => handleClose()}
        />
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
              <div className=" w-full flex py-10 flex-col overflow-hidden items-center justify-between">
                <label
                  htmlFor="file"
                  className="relative block bg-green-400 rounded-2xl h-60 w-5/6 md:w-2/3 "
                >
                  <p className="w-5/6 text-center truncate absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none text-xl md:text-2xl text-white font-bold">
                    {file != null ? file.name.toString() : "Pick a file"}
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".csv"
                    onChange={(e) => {
                      setFile(e.target.files![0]);
                    }}
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
const Item = ({ eng, rus, date, index, isLiked, isSelected, props }: Props) => {
  const queryClient = useQueryClient();
  const user = useContext(UserContext);
  const deleteMutation = useMutation(
    (word: { word?: string }) => {
      return user.authApi!.delete("/wordbooks/words/" + props.id, {
        data: word,
      });
    },
    {
      onSettled() {
        queryClient.invalidateQueries(["wordbook", props.id]);
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
  const calculate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    if (Math.floor(diff / 1000) < 60) return Math.floor(diff / 1000) + "s ago";
    if (Math.floor(diff / (1000 * 60)) < 60)
      return Math.floor(diff / (1000 * 60)) + "m ago";
    if (Math.floor(diff / (1000 * 60 * 60)) < 24)
      return Math.floor(diff / (1000 * 60 * 60)) + "h ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 30)
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + "d ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) > 30)
      return new Date(date).toLocaleDateString();
  };

  const createdAt = useMemo(() => calculate(date), []);
  const handleLike = () => {
    if (isLiked) {
      delikeMutation.mutate({ eng: eng });
    } else {
      likeMutation.mutate({ eng: eng, rus: rus });
    }
  };
  return (
    <div
      onClick={() => (isSelected = true)}
      className={
        isSelected
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
            onClick={() => deleteMutation.mutate({ word: eng })}
            className="hover:stroke-red-500 cursor-pointer duration-200"
            size={27}
          ></FiTrash2>
        </div>
      </div>
    </div>
  );
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
  const [selected, setSelected] = useState<number>();
  const [editWordbookModal, setEditWordbookModal] = useToggle(false);
  const [contextmenu, setContextmenu] = useToggle(false);
  const Menu = () => {
    return (
      <div
        className="w-60 z-10 bg-neutral-900 absolute rounded-xl overflow-hidden"
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
    if (modal || editWordbookModal == true) {
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
  }, [modal, editWordbookModal]);

  const query = useQuery<AxiosResponse<Book>, Error>(
    ["wordbook", props.id],
    () => user.authApi!.get("/wordbooks/" + props.id),
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

  const rowVirtualizer = useVirtualizer({
    count: query.data?.data.words ? query.data!.data.words!.length : 40,
    getScrollElement: () => contextAreaRef.current,
    estimateSize: () => 70,
    paddingStart: 300,
    overscan: 10,
  });
  return (
    <>
      <Head>
        <title>
          {query.data?.data?.name ? query.data.data.name : "Loading..."}
        </title>
      </Head>
      {modal && <Modal handleClose={() => setModal()} props={props} />}
      {editWordbookModal && (
        <EditWordbook
          handleClose={() => setEditWordbookModal()}
          props={props}
        />
      )}
      {contextmenu && <Menu />}
      {query.isLoading ? (
        <Loading />
      ) : (
        <div
          className="h-[calc(100vh-133px)] overflow-y-auto"
          ref={contextAreaRef}
        >
          <div
            className="relative w-full"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            <div className="flex gap-5 relative">
              <div className="w-52 h-52 shrink-0 relative">
                <Image
                  src="https://www.fillmurray.com/300/300"
                  alt="placeholder"
                  layout="fill"
                  className="aspect-square drop-shadow-2xl shadow-xl object-cover object-center cursor-pointer"
                  onClick={() => setEditWordbookModal()}
                />
              </div>

              <div className="flex flex-col justify-between overflow-hidden py-2">
                <span className="uppercase text-xs">Wordbook</span>
                <h1
                  className={`${
                    query.data!.data.name.length > 35
                      ? "text-xl md:text-2xl lg:text-3xl"
                      : "text-2xl md:text-4xl lg:text-6xl"
                  } font-semibold cursor-pointer w-full break-words`}
                  onClick={() => setEditWordbookModal()}
                >
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
              <div className="w-full h-16 flex px-2 sticky top-0 bg-neutral-800/95 border-b border-neutral-600">
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
            </div>
            {rowVirtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${item.size}px`,
                  transform: `translateY(${item.start}px)`,
                }}
              >
                <Item
                  props={props}
                  isSelected={selected == item.index ? true : false}
                  isLiked={
                    like.likesQuery.data?.data?.find(
                      (like) =>
                        like.eng === query.data!.data.words![item.index].eng
                    )?.eng === query.data!.data.words![item.index].eng
                      ? true
                      : false
                  }
                  index={item.index + 1}
                  eng={query.data!.data.words![item.index].eng}
                  rus={query.data!.data.words![item.index].rus}
                  date={query.data!.data.words![item.index].date}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default Book;
