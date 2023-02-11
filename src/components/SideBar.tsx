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
  isExpanded,
  href,
  title,
}: {
  children: ReactNode;
  isExpanded: boolean;
  href: string;
  title?: string;
}) => {
  return (
    <Link
      href={href}
      className={`flex ${
        isExpanded ? "flex-row px-4" : "flex-col "
      } cursor-pointer items-center gap-1 py-4 hover:bg-neutral-500`}
    >
      {children}
      <span className="text-sm">{title}</span>
    </Link>
  );
};
const SideBar = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <div className="fixed top-0 left-0 z-40 mt-20 hidden h-screen items-start bg-neutral-700 md:flex">
      <div
        className={`flex flex-col justify-center  ${
          isExpanded ? "w-40" : "w-16"
        }`}
      >
        <MenuIcon href={"/"} title="Home" isExpanded={isExpanded}>
          <FiHome size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>

        <MenuIcon
          href={"/wordbooks/liked"}
          title="Likes"
          isExpanded={isExpanded}
        >
          <FiHeart size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>

        <MenuIcon href={"/wordbooks"} title="Books" isExpanded={isExpanded}>
          <FiBook size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>

        <MenuIcon href={"/learn"} title="Tests" isExpanded={isExpanded}>
          <FiCheck size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>

        <MenuIcon href={"/translate"} title="Translate" isExpanded={isExpanded}>
          <FiGlobe size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/wordle"} title="Wordle" isExpanded={isExpanded}>
          <FiBold size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/theater"} title="Theater" isExpanded={isExpanded}>
          <FiTv size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
        <MenuIcon href={"/history"} title="History" isExpanded={isExpanded}>
          <FiClock size={25} className="stroke-2 group-hover:fill-white" />
        </MenuIcon>
      </div>
    </div>
  );
};

export default SideBar;
