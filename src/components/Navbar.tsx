import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiUser,
  FiBell,
  FiStar,
  FiLogOut,
  FiChevronDown,
  FiChevronUp,
  FiMenu,
} from "react-icons/fi";
import usePopout from "../utils/usePopout";
import { User, useUser } from "../utils/useUser";
import { useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { useRouter } from "next/router";
import SideBar from "./SideBar";
const Notifications = () => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
      }}
      className="absolute cursor-default top-6 -translate-x-1/2 animate-fade-in rounded-xl bg-neutral-700 w-96"
    >
      <div className="py-2 max-h-80 overflow-y-auto">
        <div className="h-16 dark:hover:bg-neutral-500 rounded-xl flex gap-5 items-center px-3">
          <FiBell></FiBell>
          <span>You got this! +5 Coins</span>
          <span className="text-gray-300/50 ">2 days ago</span>
        </div>
      </div>
    </div>
  );
};
const Popout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleLogout = async () => {
    queryClient.removeQueries(["userdata", "get-likes"]);
    queryClient.invalidateQueries(["userdata", "get-likes"]);
    if (typeof window != "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
    await router.push("/");
    router.reload();
  };
  return (
    <ul className="absolute z-10 right-0 top-6 w-60 animate-fade-in rounded-xl bg-neutral-700 overflow-hidden">
      <Link href={"/user"}>
        <li className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer ">
          <FiUser className="pointer-events-none" />
          <p className="text-center after:border-b after:w-full">Profile</p>
        </li>
      </Link>
      <li
        onClick={() => handleLogout()}
        className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer"
      >
        <FiLogOut className="pointer-events-none" />
        <span className="text-center ">Logout</span>
      </li>
    </ul>
  );
};
const GuestGreeting = () => {
  return (
    <div className="flex h-2/3 justify-center items-center">
      <Link href={"/signup"}>
        <button className="px-10 py-2 text-lg  text-white/75 rounded-xl transition duration-75 hover:font-semibold hover:text-white hover:scale-105">
          Sign up
        </button>
      </Link>
      <Link href={"/login"}>
        <button className="px-10 py-2 text-lg text-black bg-white rounded-full transition duration-75 hover:scale-105">
          Login
        </button>
      </Link>
    </div>
  );
};
const Loading = () => {
  return (
    <div className="w-3/12 bg-gray-300 h-9 animate-pulse rounded-full"></div>
  );
};
const UserGreeting = ({ user }: { user: UseQueryResult<User> }) => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const [notification, setNotification] = usePopout(notificationRef);
  const [profile, setProfile] = usePopout(userRef);
  return (
    <div className="flex gap-7 justify-center items-center">
      <div
        ref={notificationRef}
        className="cursor-pointer"
        onClick={() => {
          setNotification();
        }}
      >
        <div className="relative">
          <FiBell
            size={20}
            className="dark:fill-white cursor-pointer pointer-events-none"
          ></FiBell>
          <span className="absolute select-none pointer-events-none text-[10px] left-3 font-bold bottom-2 bg-red-500 rounded-full px-1">
            1
          </span>
          {notification && <Notifications />}
        </div>
      </div>
      <div className="flex gap-2 justify-center items-center cursor-pointer">
        <FiStar size={20} className="dark:fill-white" />0
      </div>

      <div
        onClick={() => {
          setProfile();
        }}
        ref={userRef}
        className="p-1 cursor-pointer select-none flex gap-2 items-center justify-center rounded-full bg-neutral-500"
      >
        <div className=" bg-neutral-800 rounded-full p-1">
          <FiUser size={20} className="dark:fill-white cursor-pointer" />
        </div>
        <span className="hidden lg:block">{user.data?.email}</span>
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
  const user = useUser();
  return (
    <>
      <SideBar />
      <div className="hidden max-h-20 h-full flex-1 fixed top-0 z-20 w-full md:flex pr-16 py-5 border-b border-neutral-700 items-center gap-5 justify-between dark:bg-neutral-800 dark:text-white ">
        <div className="flex flex-col rounded-full justify-center py-4 w-16 gap-1 items-center">
          <div className="rounded-full w-10 h-10 flex justify-center items-center hover:bg-neutral-600">
            <FiMenu size={25} className="stroke-2" />
          </div>
        </div>
        {user.isLoading && <Loading />}
        {user.isError && <GuestGreeting />}
        {user.isSuccess && <UserGreeting user={user} />}
      </div>
    </>
  );
};

export default Navbar;
