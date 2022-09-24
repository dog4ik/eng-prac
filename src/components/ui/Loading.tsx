import React from "react";
import { FiLoader } from "react-icons/fi";

const Loading = () => {
  return (
    <>
      <div className="flex justify-center items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <FiLoader size={35} className="animate-spin" />
      </div>
    </>
  );
};

export default Loading;
