import Link from "next/link";
import React, { ReactNode } from "react";
import {
  FiBold,
  FiBook,
  FiCheck,
  FiClock,
  FiGlobe,
  FiHeart,
  FiHome,
  FiTv,
} from "react-icons/fi";

const MenuIcon = ({
  children,
  href,
  title,
}: {
  children: ReactNode;
  href: string;
  title?: string;
}) => {
  return (
    <Link
      href={href}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl py-3 hover:bg-neutral-700`}
    >
      {children}
      <span className="text-sm">{title}</span>
    </Link>
  );
};

const SideBar = () => {
  return (
    <div className="fixed left-0 top-0 z-20 mt-20 hidden h-screen items-start text-white md:flex">
      <div className="flex w-16 flex-col justify-center">
        <MenuIcon href={"/"} title="Home">
          <FiHome size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/wordbooks/liked"} title="Likes">
          <FiHeart size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/wordbooks"} title="Books">
          <FiBook size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/learn"} title="Tests">
          <FiCheck size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/translate"} title="Translate">
          <FiGlobe size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/wordle"} title="Wordle">
          <FiBold size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/theater"} title="Theater">
          <FiTv size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/history"} title="History">
          <FiClock size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
      </div>
    </div>
  );
};

export default SideBar;
