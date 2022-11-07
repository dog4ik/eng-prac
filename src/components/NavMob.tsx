import Link from "next/link";
import React, { ReactNode } from "react";
import { FiBook, FiCheck, FiHome, FiUser } from "react-icons/fi";

const NavIcon = ({
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
      className="flex-1 w-full flex flex-col gap-1 justify-center items-center"
    >
      {children}
      <span className="text-sm">{title}</span>
    </Link>
  );
};
const NavMob = () => {
  return (
    <div className="flex z-10 max-h-16 h-16 bg-black/90 items-center shrink-0 md:hidden">
      <NavIcon href={"/"} title="Home">
        <FiHome size={25} />
      </NavIcon>

      <NavIcon href={"/wordbooks"} title="Wordbooks">
        <FiBook size={25} />
      </NavIcon>

      <NavIcon href={"/"} title="Tests">
        <FiCheck size={25} />
      </NavIcon>

      <NavIcon href={"/"} title="Profile">
        <FiUser size={25} />
      </NavIcon>
    </div>
  );
};

export default NavMob;
