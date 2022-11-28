import { useRouter } from "next/router";
import React, { useState } from "react";
import { FiX } from "react-icons/fi";
import useClose from "../../utils/useClose";
import { useWordbook } from "../../utils/useWordbook";
import Loading from "../ui/Loading";
type ModalProps = {
  handleClose: () => void;
  id?: string;
};
type ModeType = "Normal" | "Last50" | undefined;
type CardProps = {
  handleClick: (mode: ModeType) => void;
  mode: ModeType;
  title: string;
  recRange: number;
  isSelected: boolean;
};
const ModeCard = ({
  handleClick,
  recRange,
  title,
  isSelected,
  mode,
}: CardProps) => {
  return (
    <div
      className={`w-52 flex flex-col justify-center items-center h-32 rounded-lg ${
        recRange < 20 ? "bg-yellow-500" : "bg-neutral-700"
      } border-4 ${isSelected ? "border-white" : "border-neutral-600"}`}
      onClick={() => handleClick(mode)}
    >
      <span className="text-xl pointer-events-none select-none">{title}</span>
    </div>
  );
};
const TestModal = ({ id, handleClose }: ModalProps) => {
  const wordbook = useWordbook(id);
  const length = wordbook.data?.words ? wordbook.data.words.length : 0;
  const [mode, setMode] = useState<ModeType>();
  const [range, setRange] = useState<number>(0);
  const [open, setOpen] = useClose(handleClose, 200);
  const router = useRouter();
  const handleStart = async () => {
    switch (mode) {
      case "Normal":
        await router.push(`learn/test/${id}`);
        break;
      default:
        break;
    }
  };
  return (
    <div
      onClick={setOpen}
      className={`absolute top-0 left-0 h-screen w-screen backdrop-filter backdrop-blur-sm z-20 flex justify-center items-center  transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="h-2/3 w-2/3 relative bg-neutral-900 rounded-xl"
      >
        <FiX
          className="absolute right-3 top-3 cursor-pointer"
          onClick={setOpen}
          size={35}
        />
        {wordbook.isLoading && <Loading />}
        <div className="flex p-5 flex-col h-full w-full">
          <div className="">
            <span className="text-4xl">{wordbook.data?.name}</span>
          </div>
          <div className="flex-1 w-full ">
            <div className="flex gap-3 justify-center">
              <ModeCard
                mode="Normal"
                handleClick={(mode) => setMode(mode)}
                isSelected={mode === "Normal"}
                recRange={20}
                title="Normal"
              />
              <ModeCard
                mode="Last50"
                handleClick={(mode) => setMode(mode)}
                isSelected={mode === "Last50"}
                recRange={20}
                title="Last 50"
              />
            </div>
            <div className="w-full px-10 py-5 relative">
              <div className="absolute right-0">
                <p className="text-xl">{length}</p>
              </div>
              <div className="absolute left-0">
                <p className="text-xl">{0}</p>
              </div>
              <input
                onChange={(e) => setRange(e.target.valueAsNumber)}
                className="w-full"
                type="range"
                min={0}
                max={length}
              />
              <div className="flex w-full justify-center">{range}</div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <div className="flex items-center">
              {range < 20 && (
                <p className="text-yellow-400">
                  {"Recommended words amount is > 20"}
                </p>
              )}
            </div>
            <button
              className="disabled:cursor-not-allowed disabled:bg-neutral-700 px-10 py-3 bg-white rounded-lg text-black select-none"
              disabled={typeof mode === "undefined"}
              onClick={() => {
                handleStart();
              }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestModal;
