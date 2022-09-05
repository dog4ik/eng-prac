import { Head } from "next/document";
import React from "react";
import { FiLoader } from "react-icons/fi";

const Loading = () => {
  return (
    <>
      <div className="w-full h-full flex justify-center items-center">
        <FiLoader size={35} className="animate-spin" />
      </div>
    </>
  );
};

export default Loading;
