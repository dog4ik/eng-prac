import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useEffect, useRef, useState } from "react";
import { Word } from "../utils/useWordbook";
import ListItem from "./ListItem";
type ListProps = {
  words?: Word[];
  likes?: Word[];
  scrollListRef: React.RefObject<HTMLDivElement>;
  onMenu: (event: React.MouseEvent, selected: Word[]) => void;
  totalSize: (total: number) => void;
};
const WordList = ({
  words,
  likes,
  scrollListRef,
  onMenu,
  totalSize,
}: ListProps) => {
  const [selected, setSelected] = useState<Word[]>([]);
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
          setSelected(words ?? []);
          e.preventDefault();
        }
        break;
    }
  };
  useEffect(() => {
    totalSize(rowVirtualizer.getTotalSize());
  }, [words]);
  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
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
  return (
    <div ref={itemsRef} tabIndex={0} onContextMenu={(e) => onMenu(e, selected)}>
      {rowVirtualizer.getVirtualItems().map((item) => (
        <ListItem
          postion={item.start}
          key={item.key}
          onClick={(event, word) => {
            handleSelect(event, word);
          }}
          isSelected={
            selected.findIndex((word) => word.eng == words![item.index].eng) !=
            -1
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
