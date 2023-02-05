import React, { ReactNode, useEffect, useRef, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
type WrapperProps = {
  x?: number;
  y?: number;
  scroll?: boolean;
  children: ReactNode;
  getChildCount?: (count: number) => void;
};
type RowProps = {
  onClick: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  title: string;
};
type ExpandedRowProps = {
  title: string;
  children: ReactNode;
  x?: number;
  y?: number;
};
export const ExpandedRow = ({ title, children, x, y }: ExpandedRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [childCount, setChildCount] = useState(0);
  useEffect(() => {
    console.log(childCount);
    if (x != undefined && y != undefined) {
      if (window.innerWidth < x + 480) setTranslate({ x: -480, y: 0 });
      else setTranslate({ x: 0, y: 0 });
      if (window.innerHeight < y + 64 * (childCount - 1))
        setTranslate((prev) => {
          return { x: prev.x, y: -64 * (childCount - 1) };
        });
    }
  }, [x, y, childCount]);
  return (
    <li
      className="relative flex h-16 cursor-pointer items-center justify-between rounded-md pl-2 hover:bg-neutral-700"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <span className="pointer-events-none">{title}</span>
      <FiChevronRight size={30} />
      {isExpanded && (
        <div
          className="absolute top-0 right-0"
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px)`,
          }}
        >
          <MenuWrapper getChildCount={(count) => setChildCount(count)}>
            {children}
          </MenuWrapper>
        </div>
      )}
    </li>
  );
};

export const MenuRow = ({ onClick, title }: RowProps) => {
  return (
    <li
      className="flex h-16 cursor-pointer items-center rounded-md pl-2 hover:bg-neutral-700"
      onClick={onClick}
    >
      <span className="pointer-events-none">{title}</span>
    </li>
  );
};
export const MenuWrapper = ({
  x,
  y,
  getChildCount,
  scroll,
  children,
}: WrapperProps) => {
  const [anchorPoint, setAnchorPoint] = useState({
    x: x,
    y: y,
    translateX: 0,
    translateY: 0,
  });
  const listRef = useRef<HTMLUListElement>(null);
  const [childCount, setChildCount] = useState(
    listRef.current?.childElementCount ?? 0
  );
  useEffect(() => {
    setChildCount(listRef.current!.childElementCount);
    getChildCount ? getChildCount(childCount) : null;
    if (x != undefined && y != undefined) {
      let offsetX = 0;
      let offsetY = 0;
      if (window.innerWidth < x + 240) offsetX = -240;
      if (window.innerHeight < y + 64 * childCount) offsetY = -64 * childCount;
      setAnchorPoint({ x: x, y: y, translateX: offsetX, translateY: offsetY });
    }
  }, [x, y, childCount]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute z-50 w-60 rounded-md bg-neutral-900"
      style={{
        top: anchorPoint.y ?? 0,
        left: anchorPoint.x ?? 0,
        transform: `translate(${anchorPoint.translateX}px,${anchorPoint.translateY}px)`,
      }}
    >
      <ul
        ref={listRef}
        className={`w-full ${
          scroll
            ? "overflow-y-auto scrollbar-thumb-white scrollbar-track-rounded-sm scrollbar-thumb-rounded-sm"
            : ""
        }`}
        style={{ maxHeight: scroll ? 64 * 5 : childCount * 64 }}
      >
        {children}
      </ul>
    </div>
  );
};
