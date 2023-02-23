import React, { useEffect, useRef, useState } from "react";
import { FiX, FiSearch, FiPlay } from "react-icons/fi";
import { Word } from "../utils/useWordbook";
type ListBarProps = {
  words: {
    words: Word[] | undefined;
    sortState: "desc" | "asc" | "default";
    sortTitle: keyof Word;
  };
  onSort: (title: keyof Word) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: (e: React.MouseEvent) => void;
};
const SearchField = ({
  onClear,
  onChange,
}: {
  onClear: React.MouseEventHandler<HTMLDivElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchExpand, setSearchExpand] = useState(false);
  useEffect(() => {
    function handleCloseSearch(event: MouseEvent) {
      const target = event.target as HTMLDivElement;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        !inputRef.current?.value
      ) {
        setSearchExpand(false);
      }
    }
    document.addEventListener("click", handleCloseSearch);
    return () => {
      document.removeEventListener("click", handleCloseSearch);
    };
  }, [containerRef]);
  useEffect(() => {
    if (searchExpand) inputRef.current!.focus();
  }, [searchExpand]);

  return (
    <div className="relative rounded-full bg-neutral-500" ref={containerRef}>
      {searchExpand && (
        <div className="w-full ">
          <div className="relative">
            <input
              ref={inputRef}
              placeholder={"Search"}
              className="h-8 w-full rounded-full bg-neutral-500 pl-2 pr-6 text-sm font-semibold outline-none placeholder:text-sm placeholder:text-neutral-400"
              type="text"
              onChange={(e) => {
                onChange(e);
              }}
            />

            <div
              onClick={(event) => {
                onClear(event);
                setSearchExpand(false);
              }}
              className={`absolute right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full hover:bg-neutral-300`}
            >
              <FiX className="h-full w-full stroke-black" />
            </div>
          </div>
        </div>
      )}
      {!searchExpand && (
        <div
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition duration-200 hover:bg-neutral-600"
          onClick={(e) => {
            e.stopPropagation();
            setSearchExpand(true);
          }}
        >
          <FiSearch className="h-2/3 w-2/3" />
        </div>
      )}
    </div>
  );
};

const ListBar = ({ onSort, onClearSearch, onSearch, words }: ListBarProps) => {
  return (
    <div className="sticky top-0 z-10 flex h-16 w-full select-none border-b border-neutral-600 bg-neutral-800/95 px-2">
      <div className="hidden items-center sm:flex sm:w-1/12">
        <p className="text-md font-extrabold">#</p>
      </div>
      <div className="flex w-5/12 items-center sm:w-4/12">
        <div
          onClick={() => onSort("rus")}
          className={`flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all duration-300 ${
            words.sortTitle == "rus" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="text-md font-extrabold">Russian</p>
          <FiPlay
            className={`${
              ((words.sortTitle == "rus" && words.sortState == "default") ||
                words.sortTitle != "rus") &&
              "opacity-0"
            } 
                  ${
                    words.sortTitle == "rus" &&
                    words.sortState == "asc" &&
                    "rotate-90"
                  } 
                  ${
                    words.sortTitle == "rus" &&
                    words.sortState == "desc" &&
                    "-rotate-90"
                  } fill-white`}
          />
        </div>
      </div>
      <div className="flex w-5/12 items-center sm:w-4/12">
        <div
          onClick={() => onSort("eng")}
          className={`flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all duration-300 ${
            words.sortTitle == "eng" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="text-md font-extrabold">English</p>
          <FiPlay
            className={`${
              ((words.sortTitle == "eng" && words.sortState == "default") ||
                words.sortTitle != "eng") &&
              "opacity-0"
            } 
                  ${
                    words.sortTitle == "eng" &&
                    words.sortState == "asc" &&
                    "rotate-90"
                  } 
                  ${
                    words.sortTitle == "eng" &&
                    words.sortState == "desc" &&
                    "-rotate-90"
                  } fill-white`}
          />
        </div>
      </div>
      <div className="hidden w-2/12 items-center sm:flex">
        <div
          onClick={() => onSort("createdAt")}
          className={`flex cursor-pointer items-center gap-2 rounded-full p-1 transition-all duration-300 ${
            words.sortTitle == "createdAt" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="text-md font-extrabold">Addded</p>
          <FiPlay
            className={`${
              ((words.sortTitle == "createdAt" &&
                words.sortState == "default") ||
                words.sortTitle != "createdAt") &&
              "opacity-0"
            }
                  ${
                    words.sortTitle == "createdAt" &&
                    words.sortState == "asc" &&
                    "rotate-90"
                  } 
                  ${
                    words.sortTitle == "createdAt" &&
                    words.sortState == "desc" &&
                    "-rotate-90"
                  } fill-white`}
          />
        </div>
      </div>
      <div className="flex w-2/12 items-center justify-end gap-5 sm:w-1/12">
        <SearchField onClear={onClearSearch} onChange={onSearch} />
      </div>
    </div>
  );
};

export default ListBar;
