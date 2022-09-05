import React, { Ref, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FiUser,
  FiBell,
  FiStar,
  FiLogOut,
  FiLogIn,
  FiArrowUp,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { UserContext } from "../context/UserProvider";
import useToggle from "../utils/useToggle";
import usePopout from "../utils/usePopout";
const Navbar = () => {
  const notificationRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const user = useContext(UserContext);
  const [notification, setNotification] = usePopout(notificationRef);
  const [profile, setProfile] = usePopout(userRef);

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
            <span className="text-gray-300 font-semibold">2 days ago</span>
          </div>
        </div>
      </div>
    );
  };
  const User = () => {
    return (
      <ul
        onClick={(event) => {}}
        className="absolute z-10 right-0 top-6 w-60 animate-fade-in rounded-xl bg-neutral-700 overflow-hidden"
      >
        {user.islogged ? (
          <>
            <li className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer ">
              <FiUser className="pointer-events-none" />
              <p className="text-center after:border-b after:w-full">Profile</p>
            </li>
            <li
              onClick={() => user.logout()}
              className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer"
            >
              <FiLogOut className="pointer-events-none" />
              <span className="text-center ">Logout</span>
            </li>
          </>
        ) : (
          <>
            <Link href={"/login"}>
              <li className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer">
                <FiLogIn />
                <span className="text-center ">Login</span>
              </li>
            </Link>
            <Link href={"/signup"}>
              <li className="h-16 dark:hover:bg-neutral-500 flex gap-5 items-center px-3 cursor-pointer">
                <FiArrowUp />
                <span className="text-center ">Sign Up</span>
              </li>
            </Link>
          </>
        )}
      </ul>
    );
  };
  const Loading = () => {
    return (
      <div className="w-1/5 py-2 bg-gray-300 animate-pulse rounded-xl"></div>
    );
  };
  return (
    <div className="hidden md:flex px-16 py-5 border-b border-neutral-700 items-center gap-5 justify-between dark:bg-neutral-800 dark:text-white ">
      <div className="flex gap-10 justify-around dark:text-white select-none text-lg">
        <Link
          href={"/"}
          className="text-xl hover:scale-125 transition duration-300 p-5"
        >
          Home
        </Link>
        <Link
          href={"/learn"}
          className="text-xl hover:scale-125 transition duration-300 p-5"
        >
          Learn
        </Link>
        <Link
          href={"/wordbooks"}
          className="text-xl hover:scale-125 transition duration-300 p-5"
        >
          Wordbooks
        </Link>
        <Link
          href={"/translate"}
          className="text-xl hover:scale-125 transition duration-300 p-5"
        >
          Translate
        </Link>
      </div>
      {user.query?.isFetching ? (
        <Loading />
      ) : (
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
              {notification ? <Notifications /> : null}
            </div>
          </div>
          <div className="flex gap-2 justify-center items-center cursor-pointer">
            <FiStar size={20} className="dark:fill-white" />0
          </div>

          <div
            onClick={() => setProfile()}
            ref={userRef}
            className="p-1 cursor-pointer select-none flex gap-2 items-center justify-center rounded-full bg-neutral-500"
          >
            <div className=" bg-neutral-800 rounded-full p-1">
              <FiUser size={20} className="dark:fill-white cursor-pointer" />
            </div>
            <span className="hidden lg:block">
              {user.user?.email ? user.user?.email : "Guest"}
            </span>
            {profile ? (
              <FiChevronUp size={25} className="pointer-events-none" />
            ) : (
              <FiChevronDown size={25} className="pointer-events-none" />
            )}
            <div className="relative">{profile ? <User /> : null}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
