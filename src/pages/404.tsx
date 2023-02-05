import React from "react";
import Link from "next/link";

const NotFound = () => {
  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-y-1/2 -translate-x-1/2 flex-col items-center justify-center gap-10 md:flex-row">
      <h1 className="text-2xl">Page not found</h1>
      <Link href={"/"} className="rounded-xl bg-green-400 p-2 text-white">
        Return
      </Link>
    </div>
  );
};

export default NotFound;
