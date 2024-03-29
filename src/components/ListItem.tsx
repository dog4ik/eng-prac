import { useMemo } from "react";
import { FiHeart, FiMoreVertical } from "react-icons/fi";
import { Word } from "../utils/useWordbook";
type Props = {
  isLiked: boolean;
  isSelected: boolean;
  onClick: (event: React.MouseEvent, word: Word) => void;
  onLike: (isLiked: boolean) => void;
  index: number;
  postion: number;
} & Word;
const ListItem = ({
  eng,
  rus,
  createdAt,
  index,
  isLiked,
  id,
  onLike,
  isSelected,
  onClick,
  postion,
}: Props) => {
  const calculate = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (Math.floor(diff / 1000) < 60) return Math.floor(diff / 1000) + "s ago";
    if (Math.floor(diff / (1000 * 60)) < 60)
      return Math.floor(diff / (1000 * 60)) + "m ago";
    if (Math.floor(diff / (1000 * 60 * 60)) < 24)
      return Math.floor(diff / (1000 * 60 * 60)) + "h ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 30)
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + "d ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) > 30)
      return date.toLocaleDateString();
  };

  const date = useMemo(() => calculate(createdAt), [createdAt]);
  return (
    <div
      onClick={(e) => {
        onClick(e, { createdAt, eng, rus, id });
      }}
      onContextMenu={(e) => {
        onClick(e, { createdAt, eng, rus, id });
      }}
      style={{
        transform: `translateY(${postion}px)`,
      }}
      className={`absolute top-0 left-0 flex h-16 w-full rounded-md px-2 ${
        isSelected ? "bg-neutral-600 " : "hover:bg-neutral-700"
      }`}
    >
      <div className="hidden w-1/12 items-center sm:flex">
        <p className="truncate sm:text-2xl">{index}</p>
      </div>
      <div title={rus} className="flex w-5/12 shrink-0 items-center sm:w-4/12">
        <p className="truncate text-sm sm:text-2xl">{rus}</p>
      </div>
      <div title={eng} className="flex w-5/12 shrink-0 items-center sm:w-4/12">
        <p className="truncate text-sm sm:text-2xl">{eng}</p>
      </div>
      <div className="hidden w-2/12 items-center sm:flex">
        <p className="truncate text-2xl">{date}</p>
      </div>
      <div className="flex w-1/12 items-center justify-end gap-5">
        <FiHeart
          onClick={() => {
            onLike(isLiked);
          }}
          size={27}
          className={`cursor-pointer self-center duration-100 ${
            isLiked
              ? "fill-pink-500 stroke-pink-500 hover:fill-pink-400 hover:stroke-pink-400"
              : "stroke-gray-300 hover:stroke-white"
          }`}
        ></FiHeart>
      </div>
      <div className="flex w-1/12 items-center justify-end gap-5 sm:hidden">
        <FiMoreVertical onClick={() => null} className="" size={27} />
      </div>
    </div>
  );
};
export default ListItem;
