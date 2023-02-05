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
      className={`flex max-w-sm cursor-pointer items-center justify-center rounded-full border border-white/30 transition duration-200 ${
        isSelected ? "bg-white" : "bg-neutral-700 hover:bg-neutral-600"
      }`}
      onClick={onClick}
    >
      <span
        className={`truncate py-1 px-4 text-sm ${
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
    <div className="flex w-full items-center gap-4 overflow-x-auto border-b border-white/20 py-3 md:gap-10 ">
      {children}
    </div>
  );
};
