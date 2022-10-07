import { useMemo } from "react";
import { FiHeart } from "react-icons/fi";
import { useUnLikeMutation, useLikeMutaton } from "../utils/useLikes";
import { Word } from "../utils/useWordbook";
interface Props extends Word {
  isLiked: boolean;
  isSelected: boolean;
  onClick: (event: React.MouseEvent, word: Word) => void;
  index: number;
}
const ListItem = ({
  eng,
  rus,
  date,
  index,
  isLiked,
  isSelected,
  onClick,
}: Props) => {
  const delikeMutation = useUnLikeMutation();
  const likeMutation = useLikeMutaton();
  const calculate = (date: number) => {
    const diff = Date.now() - new Date(date).getTime();
    if (Math.floor(diff / 1000) < 60) return Math.floor(diff / 1000) + "s ago";
    if (Math.floor(diff / (1000 * 60)) < 60)
      return Math.floor(diff / (1000 * 60)) + "m ago";
    if (Math.floor(diff / (1000 * 60 * 60)) < 24)
      return Math.floor(diff / (1000 * 60 * 60)) + "h ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) <= 30)
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + "d ago";
    if (Math.floor(diff / (1000 * 60 * 60 * 24)) > 30)
      return new Date(date).toLocaleDateString();
  };

  const createdAt = useMemo(() => calculate(Number(date)), []);
  const handleLike = () => {
    if (isLiked) {
      delikeMutation.mutate({ eng });
    } else {
      likeMutation.mutate({ eng, rus });
    }
  };
  return (
    <div
      onClick={(e) => {
        onClick(e, { date, eng, rus });
      }}
      onContextMenu={(e) => {
        onClick(e, { date, eng, rus });
      }}
      className={`w-full h-16 rounded-md ${
        isSelected ? "bg-neutral-600 " : "hover:bg-neutral-700"
      }`}
    >
      <div className="w-full h-16 flex px-2">
        <div className="flex w-1/12 items-center">
          <p className="text-2xl truncate">{index}</p>
        </div>
        <div title={rus} className="flex w-4/12 items-center">
          <p className="text-2xl truncate">{rus}</p>
        </div>
        <div title={eng} className="flex w-4/12 items-center">
          <p className="text-2xl truncate">{eng}</p>
        </div>
        <div className="flex w-2/12 items-center">
          <p className="text-2xl truncate">{createdAt}</p>
        </div>
        <div className="flex w-1/12 gap-5 justify-end items-center">
          <FiHeart
            onClick={() => {
              handleLike();
            }}
            size={27}
            className={
              isLiked
                ? "self-center cursor-pointer duration-100 fill-pink-500 hover:fill-pink-400 stroke-pink-500 hover:stroke-pink-400"
                : "self-center cursor-pointer duration-100 stroke-gray-300 hover:stroke-white"
            }
          ></FiHeart>
        </div>
      </div>
    </div>
  );
};
export default ListItem;
