import { CSSProperties, useLayoutEffect, useState } from "react";

const useGridCols = (itemWidth: number) => {
  const [cols, setCols] = useState(0);
  const handleResize = () => {
    setCols(Math.floor(window.innerWidth / itemWidth));
  };
  useLayoutEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return {
    gridTemplateColumns: `repeat(${cols},minmax(0,1fr))`,
  } as CSSProperties;
};

export default useGridCols;
