import Link from "next/link";
import React, { ReactNode } from "react";
import {
  FiBold,
  FiBook,
  FiCheck,
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
      } py-4 gap-1 items-center cursor-pointer hover:bg-neutral-500`}
    >
      {children}
      <span className="text-sm">{title}</span>
    </Link>
  );
};
const SideBar = ({ isExpanded }: { isExpanded: boolean }) => {
  return (
    <div className="h-screen z-40 mt-20 hidden md:flex fixed items-start top-0 left-0 bg-neutral-700">
      <div
        className={`flex justify-center flex-col  ${
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
      </div>
    </div>
  );
};

export default SideBar;
