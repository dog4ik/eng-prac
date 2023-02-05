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
      className="flex w-full flex-1 flex-col items-center justify-center gap-1"
    >
      {children}
      <span className="text-sm">{title}</span>
    </Link>
  );
};
const NavMob = () => {
  return (
    <div className="z-10 flex h-16 max-h-16 shrink-0 items-center bg-black/90 md:hidden">
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
