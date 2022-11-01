import React, { ReactNode } from "react";
export const FilterChipBarItem = ({
  title,
  isSelected,
  onClick,
}: {
  title: string;
  isSelected: boolean;
  onClick: () => void;
}) => {
  return (
    <div
      className={`max-w-sm rounded-full flex justify-center items-center cursor-pointer border border-white/30 duration-200 transition ${
        isSelected ? "bg-white" : "bg-neutral-700 hover:bg-neutral-600"
      }`}
      onClick={onClick}
    >
      <span
        className={`py-1 px-4 text-sm truncate ${
          isSelected ? "text-black" : "text-white"
        }`}
      >
        {title}
      </span>
    </div>
  );
};
export const FilterChipBar = ({ children }: { children: ReactNode }) => {
  return (
    <div className="w-full border-b border-white/20 py-3 overflow-x-auto flex gap-4 md:gap-10 items-center ">
      {children}
    </div>
  );
};
