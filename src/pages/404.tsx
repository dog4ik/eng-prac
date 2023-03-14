import React from "react";
import { useRouter } from "next/router";

const NotFound = () => {
  const router = useRouter();
  return (
    <div className="absolute top-1/2 left-1/2 flex -translate-y-1/2 -translate-x-1/2 flex-col items-center justify-center gap-10 md:flex-row">
      <h1 className="text-2xl">Page not found</h1>
      <button
        onClick={() => {
          router.back();
        }}
        className="rounded-xl bg-green-400 p-2 text-white"
      >
        Return
      </button>
    </div>
  );
};

export default NotFound;
