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
      className={`fixed z-20 backdrop-filter backdrop-blur-sm top-0 left-0 w-screen h-screen flex justify-center items-center transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      }`}
      onClick={() => setOpen()}
    >
      <div
        className="bg-neutral-900 relative md:w-2/3 md:h-2/3 w-5/6 h-5/6 rounded-2xl flex flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => setOpen()}
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
