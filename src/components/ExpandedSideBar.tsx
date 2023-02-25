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
import useClose from "../utils/useClose";
type ItemProps = {
  title: string;
  href: string;
  children: ReactNode;
  onClick: () => void;
};

const SideBarItem = ({ onClick, title, children, href }: ItemProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex w-full cursor-pointer items-center rounded-xl bg-neutral-800 py-3 px-2 duration-200 sm:hover:bg-neutral-700"
    >
      <div className="mr-5 flex items-center justify-center">{children}</div>
      <span className="text-lg">{title}</span>
    </Link>
  );
};

const ExpandedSideBar = ({ handleClose }: { handleClose: () => void }) => {
  const [open, setOpen] = useClose(handleClose, 300);
  return (
    <div
      className={`fixed top-0 left-0 z-30 h-screen w-screen text-white backdrop-blur-sm backdrop-filter transition-opacity duration-300 ${
        open ? "animate-fade-in" : "opacity-0"
      }`}
      onClick={() => setOpen()}
    >
      <div
        className={`relative h-full max-h-screen w-2/3 overflow-y-auto rounded-2xl bg-neutral-900 p-4 transition-transform duration-300 sm:w-2/4 md:w-1/3 lg:w-1/3 xl:w-2/12 ${
          open ? "" : "-translate-x-full"
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex w-full flex-col items-center gap-5 overflow-y-auto py-5 overflow-x-hidden ">
          <SideBarItem href={"/"} onClick={() => setOpen()} title="Home">
            <FiHome
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-sky-500"
            />
          </SideBarItem>
          <SideBarItem
            href={"/wordbooks/liked"}
            onClick={() => setOpen()}
            title="Likes"
          >
            <FiHeart
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-pink-400"
            />
          </SideBarItem>
          <SideBarItem
            href={"/wordbooks"}
            title="Books"
            onClick={() => setOpen()}
          >
            <FiBook
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-sky-500"
            />
          </SideBarItem>
          <SideBarItem href={"/learn"} title="Tests" onClick={() => setOpen()}>
            <FiCheck
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-green-500"
            />
          </SideBarItem>
          <SideBarItem
            href={"/translate"}
            title="Translate"
            onClick={() => setOpen()}
          >
            <FiGlobe
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-green-500"
            />
          </SideBarItem>
          <SideBarItem
            href={"/wordle"}
            title="Wordle"
            onClick={() => setOpen()}
          >
            <FiBold
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-green-500"
            />
          </SideBarItem>
          <SideBarItem
            href={"/theater"}
            title="Theater"
            onClick={() => setOpen()}
          >
            <FiTv
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-pink-400"
            />
          </SideBarItem>
          <SideBarItem
            href={"/history"}
            title="History"
            onClick={() => setOpen()}
          >
            <FiClock
              size={25}
              className="stroke-2 duration-200 sm:group-hover:stroke-sky-500"
            />
          </SideBarItem>
        </div>
      </div>
    </div>
  );
};

export default ExpandedSideBar;
