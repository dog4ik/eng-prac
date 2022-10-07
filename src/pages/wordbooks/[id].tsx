import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Head from "next/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { FiArrowRight, FiLock, FiUnlock, FiX } from "react-icons/fi";
import Input from "../../components/ui/Input";
import useDebounce from "../../utils/useDebounce";
import useToggle from "../../utils/useToggle";
import Loading from "../../components/ui/Loading";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { Word, useWordbook, removeWordMutation } from "../../utils/useWordbook";
import { useLikes } from "../../utils/useLikes";
import authApi from "../../utils/authApi";
import Error from "../../components/ui/Error";
import WordbookHeader from "../../components/WordbookHeader";
import { useUser } from "../../utils/useUser";
import ListItem from "../../components/ListItem";
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
  const query = useWordbook(props.id);
  const [isPrivate, setIsPrivate] = useToggle(query.data!.private);
  const nameRef = useRef<HTMLInputElement>(null);
  const deleteMutation = useMutation(
    () => {
      return authApi!.delete("wordbooks/" + props.id);
    },
    {
      async onSuccess() {
        await queryClient.invalidateQueries(["get-wordbooks"]);
        router.replace("/wordbooks");
      },
    }
  );
  const editMutation = useMutation(
    (data: { private: boolean; name: string }) => {
      return authApi!.patch("wordbooks/" + props.id, data);
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
        className=" py-5 max-w-lg w-full relative bg-neutral-600 rounded-2xl flex flex-col "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => handleClose()}
        />
        <p className="text-3xl px-5 pb-1">Edit wordbook</p>
        <div className="flex justify-evenly self-center w-full gap-2">
          <div className="w-52 h-52  shrink-0 relative">
            <Image
              src=" https://www.placecage.com/300/300"
              alt="placeholder"
              layout="fill"
              className="aspect-square drop-shadow-2xl shadow-xl object-cover object-center cursor-pointer"
            />
          </div>
          <div className="flex gap-5 flex-col justify-between py-1">
            <Input label="Name" defaultValue={query.data?.name} ref={nameRef} />
            <div className="flex gap-3 items-center justify-between">
              <p>Is private:</p>
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
            <div className="flex justify-end gap-5">
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
      </div>
    </div>
  );
};
const Modal = ({ handleClose, props }: ModalProps) => {
  const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
  const [transition, setTranslation] = useState("");
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const input = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const fileReader = new FileReader();
  const debouncedSearch = useDebounce(searchTerm, 2000);
  useEffect(() => {
    input.current?.focus();
  }, []);

  const addMutation = useMutation(
    async (word: { eng?: string; rus?: string }) => {
      return await authApi.post("wordbooks/words/" + props.id, word);
    },
    {
      onSuccess() {
        handleClose();
      },
      async onSettled() {
        await queryClient.invalidateQueries(["wordbook", props.id]);
      },
      onError(err) {
        console.log("Error ocured");

        console.log(err);
      },
    }
  );
  const exportMutation = useMutation(
    async (file: {
      file: string | ArrayBuffer | null;
      id?: string | string[];
    }) => {
      return await authApi.post("wordbooks/words/export", file);
    },
    {
      onSuccess: () => {
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
        className="bg-neutral-700 relative md:w-2/3 md:h-2/3 w-5/6 h-5/6 rounded-2xl flex flex-col items-center"
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
            <div className="bg-gray-400 relative w-3/4 self-center flex justify-between rounded-2xl overflow-hidden">
              <div
                className={`absolute transition-transform duration-300 rounded-2xl bg-green-500 blur-sm w-1/3 h-full z-10 ${
                  option === "Manual" && "translate-x-full"
                } ${option === "Export" && "translate-x-[200%]"}
                 ${option === "Auto" && "translate-x-0"}`}
              ></div>

              <span
                onClick={() => {
                  setOption("Auto");
                }}
                className={
                  "rounded-2xl z-10 cursor-pointer basis-1/3 text-center"
                }
              >
                Auto
              </span>
              <span
                onClick={() => {
                  setOption("Manual");
                }}
                className={
                  "rounded-2xl z-10 cursor-pointer basis-1/3 text-center"
                }
              >
                Manual
              </span>
              <span
                onClick={() => {
                  setOption("Export");
                }}
                className={
                  "rounded-2xl z-10 cursor-pointer basis-1/3 text-center"
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
            {addMutation.isLoading || exportMutation.isLoading ? (
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

const Menu = ({
  x,
  y,
  words,
  id,
}: {
  x: number;
  y: number;
  words: Word[];
  id?: string | string[];
}) => {
  const deleteMutation = removeWordMutation(id);
  return (
    <div
      className="w-60 z-10 bg-neutral-900 absolute rounded-md overflow-hidden"
      style={{ top: y, left: x }}
    >
      <ul className="w-full">
        <li
          className="h-16 flex items-center pl-2 hover:bg-neutral-700 cursor-pointer"
          onClick={() =>
            deleteMutation.mutate({
              word: words.map((item) => item.eng),
            })
          }
        >
          <span className="pointer-events-none" onClick={() => {}}>
            {`Delete (${words.length})`}
          </span>
        </li>
      </ul>
    </div>
  );
};
const Wordbook = (
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const like = useLikes();
  const user = useUser();
  const scrollListRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [modal, setModal] = useToggle(false);
  const [selected, setSelected] = useState<Word[]>([]);
  const [editWordbookModal, setEditWordbookModal] = useToggle(false);
  const [contextmenu, setContextmenu] = useToggle(false);
  const wordbookQuery = useWordbook(props.id);

  const handleMenu = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLDivElement;
      let offsetX = 0;
      let offsetY = 0;
      if (itemsRef.current?.contains(target)) {
        e.preventDefault();
        if (window.innerWidth < e.pageX + 240) offsetX = -240;
        if (window.innerHeight < e.pageY + 64) offsetY = -64;
        setAnchorPoint({ x: e.pageX + offsetX, y: e.pageY + offsetY });
        setContextmenu(true);
        return;
      }
      setContextmenu(false);
    },
    [setAnchorPoint]
  );
  const handleClick = (e: MouseEvent) => {
    console.log("clicked");

    const target = e.target as HTMLDivElement;
    if (!itemsRef.current?.contains(target)) {
      setSelected([]);
    }
    setContextmenu(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        break;
      case "a":
        if (e.ctrlKey) {
          setSelected(
            wordbookQuery.data?.words ? wordbookQuery.data.words : []
          );
          e.preventDefault();
        }
        break;
    }
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const handleSelect = (event: React.MouseEvent, word: Word) => {
    if (
      event.button == 2 &&
      selected.findIndex((item) => item.eng == word.eng) !== -1
    )
      return;
    event.ctrlKey
      ? selected.findIndex((item) => item.eng == word.eng) == -1
        ? setSelected((prev) => [...prev, word])
        : setSelected((prev) => prev.filter((s) => s.eng != word.eng))
      : setSelected([word]);
  };
  const rowVirtualizer = useVirtualizer({
    count: wordbookQuery.data?.words ? wordbookQuery.data.words.length : 40,
    getScrollElement: () => scrollListRef.current,
    estimateSize: () => 64,
    paddingStart: 300,
    overscan: 10,
  });
  if (wordbookQuery.isLoading) return <Loading />;
  if (wordbookQuery.isError) return <Error />;
  if (wordbookQuery.data)
    return (
      <>
        <Head>
          <title>
            {wordbookQuery.data?.name ? wordbookQuery.data.name : "Loading..."}
          </title>
        </Head>
        {modal && <Modal handleClose={() => setModal()} props={props} />}
        {editWordbookModal && (
          <EditWordbook
            handleClose={() => setEditWordbookModal()}
            props={props}
          />
        )}
        {contextmenu && (
          <Menu
            x={anchorPoint.x}
            y={anchorPoint.y}
            words={selected}
            id={props.id}
          />
        )}

        <div
          className={`px-5 scrollbar-thin scrollbar-thumb-white scrollbar-track-rounded-xl scrollbar-thumb-rounded-2xl md:px-20 flex-1 ${
            contextmenu
              ? `overflow-hidden mr-0.5 md:mr-2.5`
              : "overflow-y-auto mr-0"
          }`}
          ref={scrollListRef}
        >
          <div
            className="relative"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {/* HEADER */}
            <WordbookHeader
              setAddModal={setModal}
              setEditModal={setEditWordbookModal}
              data={wordbookQuery.data}
              isOwner={wordbookQuery.data.userId === user.data?.id}
            />
            <div
              ref={itemsRef}
              tabIndex={0}
              onContextMenu={(e) => handleMenu(e)}
              onKeyDown={(e) => handleKeyPress(e)}
            >
              {rowVirtualizer.getVirtualItems().map((item) => (
                <div
                  className="absolute top-0 left-0 w-full"
                  key={item.key}
                  style={{
                    height: `${item.size}px`,
                    transform: `translateY(${item.start}px)`,
                  }}
                >
                  <ListItem
                    onClick={(event, word) => {
                      handleSelect(event, word);
                      console.log("selected items", selected);
                    }}
                    isSelected={
                      selected?.findIndex(
                        (word) =>
                          word.eng == wordbookQuery.data!.words![item.index].eng
                      ) != -1
                        ? true
                        : false
                    }
                    isLiked={
                      like.data?.find(
                        (like) =>
                          like.eng ===
                          wordbookQuery.data!.words![item.index].eng
                      )?.eng === wordbookQuery.data?.words![item.index].eng
                        ? true
                        : false
                    }
                    index={item.index + 1}
                    eng={wordbookQuery.data!.words![item.index].eng}
                    rus={wordbookQuery.data!.words![item.index].rus}
                    date={wordbookQuery.data!.words![item.index].date}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
};

export default Wordbook;
