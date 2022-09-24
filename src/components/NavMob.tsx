import Link from "next/link";
import React from "react";
import { FiBook, FiCheck, FiHome, FiUser } from "react-icons/fi";

const NavMob = () => {
  return (
    <div className="flex flex-1 z-10 max-h-16 h-full bg-black/90 items-center md:hidden">
      <Link href={"/"}>
        <div className="flex-1 w-full flex flex-col gap-1 justify-center items-center">
          <FiHome size={25} />
          <span className="text-sm">Home</span>
        </div>
      </Link>

      <Link href={"/wordbooks"}>
        <div className="flex-1 w-full flex flex-col gap-1 justify-center items-center">
          <FiBook size={25} />
          <span className="text-sm">Wordbooks</span>
        </div>
      </Link>

      <Link href={"/"}>
        <div className="flex-1 w-full flex flex-col gap-1 justify-center items-center">
          <FiCheck size={25} />
          <span className="text-sm">Tests</span>
        </div>
      </Link>

      <Link href={"/"}>
        <div className="flex-1 w-full flex flex-col gap-1 justify-center items-center">
          <FiUser size={25} />
          <span className="text-sm">Profile</span>
        </div>
      </Link>
    </div>
  );
};

export default NavMob;
