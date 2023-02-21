import { useMemo } from "react";
import { FiHeart } from "react-icons/fi";
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
      <div className="flex w-1/12 items-center">
        <p className="truncate text-2xl">{index}</p>
      </div>
      <div title={rus} className="flex w-4/12 items-center">
        <p className="truncate text-2xl">{rus}</p>
      </div>
      <div title={eng} className="flex w-4/12 items-center">
        <p className="truncate text-2xl">{eng}</p>
      </div>
      <div className="flex w-2/12 items-center">
        <p className="truncate text-2xl">{date}</p>
      </div>
      <div className="flex w-1/12 items-center justify-end gap-5">
        <FiHeart
          onClick={() => {
            onLike(isLiked);
          }}
          size={27}
          className={
            isLiked
              ? "cursor-pointer self-center fill-pink-500 stroke-pink-500 duration-100 hover:fill-pink-400 hover:stroke-pink-400"
              : "cursor-pointer self-center stroke-gray-300 duration-100 hover:stroke-white"
          }
        ></FiHeart>
      </div>
    </div>
  );
};
export default ListItem;
