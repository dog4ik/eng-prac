import React, { useCallback, useEffect, useState } from "react";
import useToggle from "../utils/useToggle";
import { RemoveWordMutation, Word } from "../utils/useWordbook";

const ContextMenu = ({
  words,
  id,
  activeArea,
}: {
  words: Word[];
  id?: string | string[];
  activeArea: React.RefObject<HTMLDivElement>;
}) => {
  const deleteMutation = RemoveWordMutation(id);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [contextmenu, setContextmenu] = useToggle(false);
  const [selected, setSelected] = useState<Word[]>([]);

  const handleMenu = useCallback(
    (e: React.MouseEvent, selected: Word[]) => {
      let offsetX = 0;
      let offsetY = 0;
      e.preventDefault();
      if (window.innerWidth < e.pageX + 240) offsetX = -240;
      if (window.innerHeight < e.pageY + 64) offsetY = -64;
      setAnchorPoint({ x: e.pageX + offsetX, y: e.pageY + offsetY });
      setSelected(selected);
      setContextmenu(true);
    },
    [setAnchorPoint]
  );
  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLDivElement;
    if (!activeArea.current?.contains(target)) {
      setSelected([]);
    }
    setContextmenu(false);
  };
  useEffect(() => {
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);
  return (
    <div
      className="absolute z-10 w-60 overflow-hidden rounded-md bg-neutral-900"
      style={{ top: anchorPoint.y, left: anchorPoint.x }}
    >
      <ul className="w-full">
        <li
          className="flex h-16 cursor-pointer items-center pl-2 hover:bg-neutral-700"
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

export default ContextMenu;
