import React, { useRef } from "react";
import Link from "next/link";
import {
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
} from "react-icons/fi";
import usePopout from "../utils/usePopout";
import { useRouter } from "next/router";
import SideBar from "./SideBar";
import useToggle from "../utils/useToggle";
import { trpc } from "../utils/trpc";
import { useQueryClient } from "@tanstack/react-query";
import ExpandedSideBar from "./ExpandedSideBar";
const Popout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleLogout = async () => {
    if (typeof window != "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    queryClient.clear();
    await router.push("/");
  };
  return (
    <ul className="absolute right-0 top-6 z-10 w-60 animate-fade-in overflow-hidden rounded-xl bg-neutral-700">
      <Link href={"/user"}>
        <li className="flex h-16 cursor-pointer items-center gap-5 px-3 dark:hover:bg-neutral-500 ">
          <FiUser className="pointer-events-none" />
          <p className="text-center after:w-full after:border-b">Profile</p>
        </li>
      </Link>
      <li
        onClick={() => handleLogout()}
        className="flex h-16 cursor-pointer items-center gap-5 px-3 dark:hover:bg-neutral-500"
      >
        <FiLogOut className="pointer-events-none" />
        <span className="text-center ">Logout</span>
      </li>
    </ul>
  );
};
const GuestGreeting = () => {
  return (
    <div className="flex h-2/3 animate-fade-in items-center justify-center">
      <Link href={"/signup"}>
        <button className="rounded-xl px-5 py-1 text-lg text-white/75 transition duration-75 hover:scale-105 hover:font-semibold hover:text-white sm:py-2 sm:px-10">
          Sign up
        </button>
      </Link>
      <Link href={"/login"}>
        <button className="rounded-full bg-white px-5 py-1 text-lg text-black transition duration-75 hover:scale-105 sm:py-2 sm:px-10">
          Login
        </button>
      </Link>
    </div>
  );
};
const UserGreeting = ({ email }: { email: string }) => {
  const userRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = usePopout(userRef);
  return (
    <div className="flex animate-fade-in items-center justify-center gap-7">
      <div
        onClick={() => {
          setProfile();
        }}
        ref={userRef}
        className="flex cursor-pointer select-none items-center justify-center gap-2 rounded-full bg-neutral-500 p-1"
      >
        <div className=" rounded-full bg-neutral-800 p-1">
          <FiUser size={20} className="cursor-pointer dark:fill-white" />
        </div>
        <span className="hidden lg:block">{email}</span>
        {profile ? (
          <FiChevronUp size={25} className="pointer-events-none" />
        ) : (
          <FiChevronDown size={25} className="pointer-events-none" />
        )}
        <div className="relative">{profile && <Popout />}</div>
      </div>
    </div>
  );
};
const Navbar = () => {
  const user = trpc.user.credentials.useQuery(undefined, {
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
  const [isExpanded, setIsExpanded] = useToggle(false);
  return (
    <>
      {isExpanded && <ExpandedSideBar handleClose={setIsExpanded} />}
      <SideBar />
      <div className="sticky top-0 z-20 flex h-full max-h-20 w-full flex-1 items-center justify-between gap-5 border-b border-neutral-700 bg-neutral-800 py-5 pr-2 dark:bg-neutral-800 dark:text-white sm:pr-16 ">
        <div
          onClick={() => setIsExpanded()}
          className="flex w-16 flex-col items-center justify-center gap-1 rounded-full py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-600">
            <FiMenu size={25} className="stroke-2" />
          </div>
        </div>
        {user.isError && <GuestGreeting />}
        {user.isSuccess && <UserGreeting email={user.data.email} />}
      </div>
    </>
  );
};

export default Navbar;
