"use client";
import React, { use, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import useDebounce from "../../../../../utils/useDebounce";
import useClose from "../../../../../utils/useClose";
import Input from "../../../../components/ui/Input";
import { downloadSubs, getSubsList } from "../../../../lib/TheaterActions";
type ModalProps = {
  tmdbIdPromise: Promise<number | undefined>;
};

type RowProps = {
  title: string;
  downloads: number;
  onClick: () => void;
  state: "error" | "loading" | "normal";
};

const SrtRow = ({ title, downloads, onClick, state }: RowProps) => {
  return (
    <>
      <div
        className={`flex h-24 shrink-0 cursor-pointer items-center justify-between rounded-md px-5 ${
          state === "normal"
            ? "bg-neutral-900 hover:bg-neutral-800"
            : state === "error"
            ? "bg-red-500"
            : "animate-pulse bg-neutral-600"
        } duration-150`}
        onClick={onClick}
      >
        <span className="w-5/6 truncate text-white">{title}</span>
        <span className="text-white">{downloads}</span>
      </div>
    </>
  );
};

const Error = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <>
      <div className="flex h-full flex-col items-center justify-center gap-5">
        <span className="text-2xl">Failed to load subs</span>
        <div onClick={onRetry}>
          <button className="rounded-full bg-white px-5 py-3 text-black">
            Try again
          </button>
        </div>
      </div>
    </>
  );
};

const SrtModal = ({ tmdbIdPromise }: ModalProps) => {
  let tmdbId = use(tmdbIdPromise);
  const [open, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useClose(() => setIsOpen(false), 200);
  const [currentId, setCurrentId] = useState<string>();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState<string>("en");
  const [subsList, setSubsList] =
    useState<Awaited<ReturnType<typeof getSubsList>>>();
  const debouncedQuery = useDebounce(query, 1000);
  useEffect(() => {
    if (!tmdbId) return;
    getSubsList({ lang, tmdbId, query: debouncedQuery }).then((data) => {
      setSubsList(data);
    });
  }, [debouncedQuery]);
  if (!open || !tmdbId) return null;
  return (
    <div
      className={`fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm backdrop-filter transition-opacity duration-200 ${
        isClosing ? "animate-fade-in" : "opacity-0"
      } `}
      onClick={() => {
        setIsClosing();
      }}
    >
      <div
        className="relative flex h-2/3 w-5/6 flex-col overflow-hidden rounded-md bg-neutral-900 "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="absolute right-2 top-2 cursor-pointer"
          onClick={() => {
            setIsClosing();
          }}
        >
          <FiX size={35} />
        </div>
        <div className="flex h-20 shrink-0 items-center bg-neutral-700 pl-4">
          <span className="text-xl">Subtitles</span>
        </div>
        <div className="my-2 flex h-20 items-center gap-10 px-10">
          <select
            onChange={(e) => setLang(e.target.value)}
            className="rounded-xl bg-neutral-700 p-2 outline-none"
          >
            <option value={"en"}>English</option>
            <option value={"ru"}>Russian</option>
            <option value={"sr"}>Serbian</option>
            <option value={"es"}>Spanish</option>
          </select>
          <div className="w-full">
            <Input
              label="Search"
              value={query}
              onChange={(e) => {
                console.log(e);
                setQuery(e.target.value);
              }}
              style={{ backgroundColor: "rgb(64 64 64)" }}
            />
          </div>
          <div>Downloads</div>
        </div>
        <div className=" flex h-full flex-col overflow-y-auto rounded-xl">
          {subsList?.map((item) => (
            <SrtRow
              onClick={() => {
                setCurrentId(item.id);
                downloadSubs(item.attributes.files[0].file_id);
              }}
              state={
                item.id !== currentId
                  ? "normal"
                  : // WARN:handle this
                  false //downloadMutation.isError
                  ? "error"
                  : "loading"
              }
              key={item.id}
              downloads={item.attributes.download_count}
              title={item.attributes.files[0].file_name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SrtModal;
