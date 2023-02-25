import React, {
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FiChevronRight } from "react-icons/fi";
type WrapperProps = {
  x?: number;
  y?: number;
  callerRef?: React.RefObject<HTMLElement>;
  scroll?: boolean;
  onClose?: () => void;
  children: ReactNode;
  getChildCount?: (count: number) => void;
};
type RowProps = {
  onClick?: (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => void;
  title: string;
};
type ExpandedRowProps = {
  title: string;
  children: ReactNode;
};
export const ExpandedRow = ({ title, children }: ExpandedRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [childCount, setChildCount] = useState(0);
  let timeout = useRef<NodeJS.Timeout>();
  const expandedRowRef = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    if (expandedRowRef.current) {
      const { x, y } = expandedRowRef.current.getBoundingClientRect();
      let translateX: number = 0;
      let translateY: number = 0;
      if (window.innerWidth < x + 480) translateX = -480;
      if (window.innerHeight < y + 40 * childCount)
        translateY = -40 * (childCount - 1);
      setTranslate({ x: translateX, y: translateY });
    }
  }, [expandedRowRef.current, childCount]);
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);
  return (
    <li
      className="relative flex h-10 cursor-pointer items-center justify-between rounded-md pl-2 hover:bg-neutral-700"
      onMouseEnter={() => {
        clearTimeout(timeout.current);
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        timeout.current = setTimeout(() => {
          setIsExpanded(false);
        }, 200);
      }}
      ref={expandedRowRef}
    >
      <span className="pointer-events-none text-white">{title}</span>
      <FiChevronRight className="stroke-white" size={30} />
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
      className="flex h-10 cursor-pointer items-center rounded-md pl-2 hover:bg-neutral-700"
      onClick={onClick}
    >
      <span className="pointer-events-none text-white">{title}</span>
    </li>
  );
};
export const MenuWrapper = ({
  x,
  y,
  getChildCount,
  scroll,
  children,
  callerRef,
  onClose,
}: WrapperProps) => {
  if (typeof window != undefined) {
    if (window.innerWidth < 640) return null;
  }
  const [anchorPoint, setAnchorPoint] = useState({
    x,
    y,
    translateX: 0,
    translateY: 0,
  });
  const listRef = useRef<HTMLUListElement>(null);
  const [childCount, setChildCount] = useState(0);

  useLayoutEffect(() => {
    if (listRef.current) setChildCount(listRef.current.childElementCount);
    if (getChildCount) getChildCount(childCount);
    if (x != undefined && y != undefined) {
      let offsetX = 0;
      let offsetY = 0;
      if (window.innerWidth < x + 240) offsetX = -240;
      if (window.innerHeight < y + 40 * childCount) offsetY = -40 * childCount;
      setAnchorPoint({
        x: window.innerWidth < x ? window.innerWidth : x,
        y: window.innerHeight < y ? window.innerHeight : y,
        translateX: offsetX,
        translateY: offsetY,
      });
    }
  }, [x, y, childCount]);
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLDivElement;
      if (
        listRef.current?.contains(target) ||
        callerRef?.current?.contains(target)
      )
        return;
      e.preventDefault();
      e.stopPropagation();
      if (onClose) onClose();
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [listRef.current, callerRef?.current]);

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="fixed z-50 w-60 rounded-md bg-neutral-900"
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
        style={{ maxHeight: scroll ? 40 * 5 : childCount * 40 }}
      >
        {children}
      </ul>
    </div>
  );
};
