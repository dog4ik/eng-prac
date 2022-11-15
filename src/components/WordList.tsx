import { useVirtualizer } from "@tanstack/react-virtual";
import React, { forwardRef, Ref, useEffect, useRef } from "react";
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
    paddingStart: 300,
    overscan: 10,
  });
  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        break;
      case "a":
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
    <div ref={itemsRef} tabIndex={0} onContextMenu={(e) => handleMenu(e)}>
      {rowVirtualizer.getVirtualItems().map((item) => (
        <ListItem
          postion={item.start}
          key={item.key}
          onClick={(event, word) => {
            handleSelect(event, word);
          }}
          isSelected={
            selectedWords.findIndex(
              (word) => word.eng == words![item.index].eng
            ) != -1
              ? true
              : false
          }
          isLiked={
            likes?.find((like) => like.eng === words![item.index].eng)?.eng ===
            words![item.index].eng
              ? true
              : false
          }
          index={item.index + 1}
          eng={words![item.index].eng}
          rus={words![item.index].rus}
          id={words![item.index].id}
          createdAt={words![item.index].createdAt}
        />
      ))}
    </div>
  );
};

export default WordList;
