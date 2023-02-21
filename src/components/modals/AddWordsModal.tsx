import React, { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { trpc } from "../../utils/trpc";
import useClose from "../../utils/useClose";
import useDebounce from "../../utils/useDebounce";
import { useNotifications } from "../context/NotificationCtx";
import Input from "../ui/Input";
import Loading from "../ui/Loading";
type ModalProps = {
  handleClose: () => void;
  id: string;
};
const AddWordsModal = ({ handleClose, id }: ModalProps) => {
  const [option, setOption] = useState<"Auto" | "Manual" | "Export">("Auto");
  const [open, setOpen] = useClose(handleClose, 200);
  const [transition, setTranslation] = useState("");
  const queryClient = trpc.useContext();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const input = useRef<HTMLInputElement>(null);
  const input2 = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const fileReader = new FileReader();
  const debouncedSearch = useDebounce(searchTerm, 2000);
  const notificator = useNotifications();
  useEffect(() => {
    input.current?.focus();
  }, []);

  const addMutation = trpc.words.addWord.useMutation({
    async onMutate(variable) {
      await queryClient.words.getWordbook.cancel({ id });
      const snapShot = queryClient.words.getWordbook.getData({ id });
      queryClient.words.getWordbook.setData({ id }, (old) => {
        let updatedWords = old?.words;
        updatedWords = [
          ...(updatedWords ?? []),
          ...variable.words
            .filter((item) => item.rus !== undefined)
            .map((item) => {
              return {
                createdAt: new Date(),
                eng: item.eng,
                rus: item.rus ?? "",
                id: "Invalid ID that shoud be reinvalidated",
              };
            }),
        ];
        if (old) return { ...old, words: updatedWords };
      });
      return { snapShot };
    },
    async onError(err, _, context) {
      queryClient.words.getWordbook.setData({ id }, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to add words" });
      else notificator({ type: "error", message: "Failed to add words" });
    },
    onSuccess() {
      setOpen();
    },
    onSettled() {
      queryClient.words.getWordbook.invalidate({ id });
      queryClient.words.getAllWordbooks.invalidate();
    },
  });
  const exportMutation = trpc.words.exportWords.useMutation({
    onSuccess: (data) => {
      if (data.failed)
        notificator({
          type: "error",
          message: `Failed to export ${data.failed} ${
            data.failed === 1 ? "word" : "words"
          }`,
        });
      else
        notificator({
          type: "success",
          message: `All words are exported`,
        });
      setOpen();
    },
    onError(err) {
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to add words" });
      else notificator({ type: "error", message: "Failed to export words" });
    },
    onSettled: () => {
      queryClient.words.getWordbook.invalidate({ id });
      queryClient.words.getAllWordbooks.invalidate();
    },
  });
  const translateMutation = trpc.translate.translate.useMutation({
    onSuccess: (data) => {
      setTranslation(data.translations[0].text);
    },
    onError(err) {
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to add words" });
      else notificator({ type: "error", message: "Failed to export words" });
    },
  });
  useEffect(() => {
    if (searchTerm && searchTerm.trim() != "")
      translateMutation.mutate({ text: debouncedSearch });
    else null;
  }, [debouncedSearch]);

  const handleAdd = () => {
    if (input.current) {
      if (option === "Auto") {
        addMutation.mutate({
          words: [{ eng: input.current.value }],
          wordbookId: id,
        });
      }
      if (option === "Manual") {
        addMutation.mutate({
          words: [
            {
              eng: input.current.value,
              rus: input2.current?.value,
            },
          ],
          wordbookId: id,
        });
      }
    }
    if (option === "Export") {
      if (!file || file.type != "text/csv") return;
      fileReader.onload = function (event) {
        const csvOutput = event.target?.result;
        exportMutation.mutate({ file: csvOutput?.toString() ?? "", id: id });
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
                  option === "Manual" ? "translate-x-full" : ""
                } ${option === "Export" ? "translate-x-[200%]" : ""}
                   ${option === "Auto" ? "translate-x-0" : ""}`}
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
              />
              <FiArrowRight size={35} />
              <span className="basis-1/3">{transition}</span>
            </div>
          ) : option == "Manual" ? (
            <>
              <div className="flex items-center justify-center">
                <Input ref={input} label="Eng" required={false} type="text" />
                <FiArrowRight size={35} />
                <Input ref={input2} label="Rus" type="text" required={false} />
              </div>
            </>
          ) : option == "Export" ? (
            <>
              <div className="flex w-full flex-col items-center justify-between overflow-hidden py-10">
                <label
                  htmlFor="file"
                  className="relative block h-60 w-5/6 cursor-pointer rounded-2xl bg-green-400 md:w-2/3 "
                >
                  <p className="pointer-events-none absolute left-1/2 top-1/2 w-5/6 -translate-x-1/2 -translate-y-1/2 truncate text-center text-xl font-bold text-white md:text-2xl">
                    {file != null ? file.name.toString() : "Pick a file"}
                  </p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      setFile(e.target.files![0]);
                    }}
                    id="file"
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
              <span>Add</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWordsModal;
