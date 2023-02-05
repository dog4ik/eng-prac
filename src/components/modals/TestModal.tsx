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
      className={`flex h-32 w-52 flex-col items-center justify-center rounded-lg ${
        recRange < 20 ? "bg-yellow-500" : "bg-neutral-700"
      } border-4 ${isSelected ? "border-white" : "border-neutral-600"}`}
      onClick={() => handleClick(mode)}
    >
      <span className="pointer-events-none select-none text-xl">{title}</span>
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
      className={`absolute top-0 left-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm backdrop-filter  transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="relative h-2/3 w-2/3 rounded-xl bg-neutral-900"
      >
        <FiX
          className="absolute right-3 top-3 cursor-pointer"
          onClick={setOpen}
          size={35}
        />
        {wordbook.isLoading && <Loading />}
        <div className="flex h-full w-full flex-col p-5">
          <div className="">
            <span className="text-4xl">{wordbook.data?.name}</span>
          </div>
          <div className="w-full flex-1 ">
            <div className="flex justify-center gap-3">
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
            <div className="relative w-full px-10 py-5">
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
              className="select-none rounded-lg bg-white px-10 py-3 text-black disabled:cursor-not-allowed disabled:bg-neutral-700"
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
