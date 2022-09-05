import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 flex flex-col md:flex-row gap-10 justify-center items-center">
      <h1 className="text-2xl">Page not found</h1>
      <Link href={"/"} className="p-2 rounded-xl bg-green-400 text-white">
        Return
      </Link>
    </div>
  );
};

export default NotFound;
