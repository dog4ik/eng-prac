import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import authApi from "../../utils/authApi";
import useClose from "../../utils/useClose";
import useDebounce from "../../utils/useDebounce";
import Input from "../ui/Input";
import Loading from "../ui/Loading";
type ModalProps = {
  handleClose: () => void;
  id?: string;
};
const AddWordsModal = ({ handleClose, id }: ModalProps) => {
  const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
  const [open, setOpen] = useClose(handleClose, 200);
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
      return await authApi.post("wordbooks/words/" + id, word);
    },
    {
      onSuccess() {
        setOpen();
      },
      async onSettled() {
        await queryClient.invalidateQueries(["wordbook", id]);
      },
      onError(err) {
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
        setOpen();
      },
      onSettled: () => {
        queryClient.invalidateQueries(["wordbook", id]);
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
        exportMutation.mutate({ file: csvOutput, id: id });
      };
      fileReader.readAsText(file);
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm backdrop-filter transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      }`}
      onClick={() => setOpen()}
    >
      <div
        className="relative flex h-5/6 w-5/6 flex-col items-center rounded-2xl bg-neutral-900 md:h-2/3 md:w-2/3"
        onClick={(event) => event.stopPropagation()}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => setOpen()}
        />
        <div className="flex h-full w-5/6 flex-col">
          <div className="flex flex-col gap-4">
            <h1 className="text-center text-2xl">Add word</h1>
            <div className="relative flex w-3/4 justify-between self-center overflow-hidden rounded-2xl bg-gray-400">
              <div
                className={`absolute z-10 h-full w-1/3 rounded-2xl bg-green-500 blur-sm transition-transform duration-300 ${
                  option === "Manual" && "translate-x-full"
                } ${option === "Export" && "translate-x-[200%]"}
                   ${option === "Auto" && "translate-x-0"}`}
              ></div>

              <span
                onClick={() => {
                  setOption("Auto");
                }}
                className={
                  "z-10 basis-1/3 cursor-pointer rounded-2xl text-center"
                }
              >
                Auto
              </span>
              <span
                onClick={() => {
                  setOption("Manual");
                }}
                className={
                  "z-10 basis-1/3 cursor-pointer rounded-2xl text-center"
                }
              >
                Manual
              </span>
              <span
                onClick={() => {
                  setOption("Export");
                }}
                className={
                  "z-10 basis-1/3 cursor-pointer rounded-2xl text-center"
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
              <div className=" flex w-full flex-col items-center justify-between overflow-hidden py-10">
                <label
                  htmlFor="file"
                  className="relative block h-60 w-5/6 rounded-2xl bg-green-400 md:w-2/3 "
                >
                  <p className="pointer-events-none absolute left-1/2 top-1/2 w-5/6 -translate-x-1/2 -translate-y-1/2 truncate text-center text-xl font-bold text-white md:text-2xl">
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
                    className="h-full w-full cursor-pointer opacity-0 file:hidden"
                  />
                </label>
              </div>
            </>
          ) : null}
          <button
            onClick={() => handleAdd()}
            className="absolute right-10 bottom-10 flex items-center justify-center self-end rounded-xl bg-green-400 py-5 px-10"
          >
            {addMutation.isLoading || exportMutation.isLoading ? (
              <Loading />
            ) : (
              <span className="absolute">Add</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWordsModal;
