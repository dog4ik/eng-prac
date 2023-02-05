import React from "react";
import { FiSmile } from "react-icons/fi";

const Error = () => {
  return (
    <div className=" absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 p-2 ">
      <p className="text-xl md:text-3xl">Something went wrong</p>
      <div className="rotate-180 overflow-hidden rounded-full duration-700 hover:rotate-0">
        <FiSmile className="h-32 w-32 fill-yellow-300 stroke-black stroke-1" />
      </div>
    </div>
  );
};

export default Error;
