import React from "react";
import { FiSmile } from "react-icons/fi";

const Error = () => {
  return (
    <div className=" flex group p-2 flex-col gap-3 justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ">
      <p className="text-xl md:text-3xl">Something went wrong</p>
      <div className="rotate-180 overflow-hidden rounded-full group-hover:rotate-0 duration-700">
        <FiSmile className="stroke-1 fill-yellow-300 stroke-black w-32 h-32" />
      </div>
    </div>
  );
};

export default Error;
