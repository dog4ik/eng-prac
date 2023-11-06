import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  elementSize: number;
};
export default function BlockGrid({ children, elementSize }: Props) {
  return (
    <div
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${elementSize}px, 1fr))`,
      }}
      className="grid place-items-center gap-10 p-4"
    >
      {children}
    </div>
  );
}
