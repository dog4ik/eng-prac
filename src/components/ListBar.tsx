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
    <div className="rounded-full bg-neutral-500 relative" ref={containerRef}>
      {searchExpand && (
        <div className="w-full ">
          <div className="relative">
            <input
              ref={inputRef}
              placeholder={"Search"}
              className="w-full rounded-full bg-neutral-500 h-8 text-sm pl-2 pr-6 outline-none font-semibold placeholder:text-sm placeholder:text-neutral-400"
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
              className={`absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 hover:bg-neutral-300 rounded-full flex justify-center items-center cursor-pointer`}
            >
              <FiX className="w-full h-full stroke-black" />
            </div>
          </div>
        </div>
      )}
      {!searchExpand && (
        <div
          className="w-8 h-8 rounded-full hover:bg-neutral-600 transition duration-200 flex justify-center items-center cursor-pointer"
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
    <div className="w-full select-none h-16 flex px-2 sticky top-0 bg-neutral-800/95 z-10 border-b border-neutral-600">
      <div className="flex w-1/12 items-center">
        <p className="font-extrabold text-md">#</p>
      </div>
      <div className="flex w-4/12 items-center">
        <div
          onClick={() => onSort("rus")}
          className={`flex gap-2 p-1 rounded-full items-center transition-all duration-300 cursor-pointer ${
            words.sortTitle == "rus" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="font-extrabold text-md">Russian</p>
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
      <div className="flex w-4/12 items-center">
        <div
          onClick={() => onSort("eng")}
          className={`flex gap-2 p-1 rounded-full items-center transition-all duration-300 cursor-pointer ${
            words.sortTitle == "eng" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="font-extrabold text-md">English</p>
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
      <div className="flex w-2/12 items-center">
        <div
          onClick={() => onSort("createdAt")}
          className={`flex gap-2 p-1 rounded-full items-center transition-all duration-300 cursor-pointer ${
            words.sortTitle == "createdAt" &&
            words.sortState != "default" &&
            "bg-neutral-500"
          }`}
        >
          <p className="font-extrabold text-md">Addded</p>
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
      <div className="flex w-1/12 gap-5 justify-end items-center">
        <SearchField onClear={onClearSearch} onChange={onSearch} />
      </div>
    </div>
  );
};

export default ListBar;
