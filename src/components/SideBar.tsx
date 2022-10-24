import Link from "next/link";
import React from "react";
import { FiBook, FiCheck, FiGlobe, FiHeart, FiHome } from "react-icons/fi";

const SideBar = () => {
  return (
    <div className="h-screen hidden md:flex fixed items-start top-0 left-0 z-20 bg-neutral-700">
      <div className="flex flex-col justify-center w-16">
        <Link href={"/"}>
          <div className="flex flex-col justify-center py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500">
            <FiHome size={25} className="stroke-2 group-hover:fill-white" />
            <span className="text-sm">Home</span>
          </div>
        </Link>
        <Link href={"/wordbooks/liked"}>
          <div className="flex flex-col justify-center py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500">
            <FiHeart size={25} className="stroke-2 group-hover:fill-white" />
            <span className="text-sm">Likes</span>
          </div>
        </Link>
        <Link href={"/wordbooks"}>
          <div className="flex flex-col justify-center py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500">
            <FiBook size={25} className="stroke-2 group-hover:fill-white" />
            <span className="text-sm">Words</span>
          </div>
        </Link>
        <Link href={"/learn"}>
          <div className="flex flex-col justify-center py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500">
            <FiCheck size={25} className="stroke-2 group-hover:fill-white" />
            <span className="text-sm">Tests</span>
          </div>
        </Link>
        <Link href={"/translate"}>
          <div className="flex flex-col justify-center py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500">
            <FiGlobe size={25} className="stroke-2 group-hover:fill-white" />
            <span className="text-sm">Translate</span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SideBar;
