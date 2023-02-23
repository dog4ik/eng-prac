import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useEffect, useRef } from "react";
import { useLikeMutaton, useUnLikeMutation } from "../utils/useLikes";
import { Word } from "../utils/useWordbook";
import { useWordbookCtx } from "./context/WordbookCtx";
import ListItem from "./ListItem";
type ListProps = {
  words?: Word[];
  likes?: Word[];
  scrollListRef: React.RefObject<HTMLDivElement>;
  totalSize: (total: number) => void;
};
const WordList = ({ scrollListRef, totalSize, likes, words }: ListProps) => {
  const {
    selectedWords,
    setSelectedWords,
    setIsMenuOpen,
    isMenuOpen,
    handleMenu,
  } = useWordbookCtx();
  const itemsRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: words?.length ?? 0,
    getScrollElement: () => scrollListRef.current,
    estimateSize: () => 64,
    paddingStart: window.innerWidth < 640 ? 420 : 300,
    overscan: 10,
  });
  const delikeMutation = useUnLikeMutation();
  const likeMutation = useLikeMutaton();

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.code) {
      case "ArrowDown":
        break;
      case "KeyA":
        if (e.ctrlKey) {
          setSelectedWords([...words!] ?? []);
          e.preventDefault();
        }
        break;
    }
  };
  useEffect(() => {
    totalSize(rowVirtualizer.getTotalSize());
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [words]);

  const handleScroll = (e: Event) => {
    const target = e.target as HTMLDivElement;
    if (scrollListRef.current?.contains(target) && isMenuOpen) {
      setIsMenuOpen(false);
    }
  };
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (!itemsRef.current?.contains(target)) {
        setSelectedWords([]);
      }
      setIsMenuOpen(false);
    };
    document.addEventListener("click", handleClick);
    scrollListRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("click", handleClick);
      scrollListRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSelect = (event: React.MouseEvent, word: Word) => {
    if (
      event.button == 2 &&
      selectedWords.findIndex((item) => item.eng == word.eng) !== -1
    )
      return;
    event.ctrlKey
      ? selectedWords.findIndex((item) => item.eng == word.eng) == -1
        ? setSelectedWords((prev) => [...prev, word])
        : setSelectedWords((prev) => prev.filter((s) => s.eng != word.eng))
      : setSelectedWords([word]);
  };
  return (
    <div
      className="divide-y divide-neutral-600 sm:divide-y-0"
      ref={itemsRef}
      tabIndex={0}
      onContextMenu={(e) => handleMenu(e)}
    >
      {rowVirtualizer.getVirtualItems().map((item) => {
        const word = words![item.index];
        return (
          <ListItem
            postion={item.start}
            key={item.key}
            onClick={(event, word) => {
              handleSelect(event, word);
            }}
            isSelected={
              selectedWords.findIndex((selWord) => selWord.eng == word.eng) !=
              -1
                ? true
                : false
            }
            isLiked={
              likes?.find((like) => like.eng === word.eng)?.eng === word.eng
                ? true
                : false
            }
            index={item.index + 1}
            eng={word.eng}
            onLike={(bool) => {
              if (bool) {
                delikeMutation.mutate([{ eng: word.eng }]);
              } else {
                likeMutation.mutate([{ eng: word.eng, rus: word.rus }]);
              }
            }}
            rus={word.rus}
            id={word.id}
            createdAt={word.createdAt}
          />
        );
      })}
    </div>
  );
};

export default WordList;
