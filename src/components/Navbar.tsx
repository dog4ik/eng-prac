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
const Popout = () => {
  const queryClient = trpc.useContext();
  const router = useRouter();
  const handleLogout = async () => {
    queryClient.user.credentials.reset();
    queryClient.user.credentials.invalidate();
    queryClient.words.getLikes.invalidate();
    if (typeof window != "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
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
    <div className="flex h-2/3 items-center justify-center">
      <Link href={"/signup"}>
        <button className="rounded-xl px-10 py-2  text-lg text-white/75 transition duration-75 hover:scale-105 hover:font-semibold hover:text-white">
          Sign up
        </button>
      </Link>
      <Link href={"/login"}>
        <button className="rounded-full bg-white px-10 py-2 text-lg text-black transition duration-75 hover:scale-105">
          Login
        </button>
      </Link>
    </div>
  );
};
const Loading = () => {
  return (
    <div className="h-9 w-3/12 animate-pulse rounded-full bg-gray-300"></div>
  );
};
const UserGreeting = ({ email }: { email: string }) => {
  const userRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = usePopout(userRef);
  return (
    <div className="flex items-center justify-center gap-7">
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
  });
  const [isExpanded, setIsExpanded] = useToggle(false);
  return (
    <>
      <SideBar isExpanded={isExpanded} />
      <div className="fixed top-0 z-20 hidden h-full max-h-20 w-full flex-1 items-center justify-between gap-5 border-b border-neutral-700 py-5 pr-16 dark:bg-neutral-800 dark:text-white md:flex ">
        <div
          onClick={() => setIsExpanded()}
          className="flex w-16 flex-col items-center justify-center gap-1 rounded-full py-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-neutral-600">
            <FiMenu size={25} className="stroke-2" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-10">
          <span>
            This product uses the TMDB API but is not endorsed or certified by
            TMDB.
          </span>
          <div className="flex h-32 w-20 items-center justify-center">
            <svg
              className="fill-white"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 190.24 81.52"
            >
              <defs>
                <style></style>
                <linearGradient
                  id="linear-gradient"
                  y1="40.76"
                  x2="190.24"
                  y2="40.76"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#90cea1" />
                  <stop offset="0.56" stopColor="#3cbec9" />
                  <stop offset="1" stopColor="#00b3e5" />
                </linearGradient>
              </defs>
              <title>Asset 2</title>
              <g id="Layer_2" data-name="Layer 2">
                <g id="Layer_1-2" data-name="Layer 1">
                  <path d="M105.67,36.06h66.9A17.67,17.67,0,0,0,190.24,18.4h0A17.67,17.67,0,0,0,172.57.73h-66.9A17.67,17.67,0,0,0,88,18.4h0A17.67,17.67,0,0,0,105.67,36.06Zm-88,45h76.9A17.67,17.67,0,0,0,112.24,63.4h0A17.67,17.67,0,0,0,94.57,45.73H17.67A17.67,17.67,0,0,0,0,63.4H0A17.67,17.67,0,0,0,17.67,81.06ZM10.41,35.42h7.8V6.92h10.1V0H.31v6.9h10.1Zm28.1,0h7.8V8.25h.1l9,27.15h6l9.3-27.15h.1V35.4h7.8V0H66.76l-8.2,23.1h-.1L50.31,0H38.51ZM152.43,55.67a15.07,15.07,0,0,0-4.52-5.52,18.57,18.57,0,0,0-6.68-3.08,33.54,33.54,0,0,0-8.07-1h-11.7v35.4h12.75a24.58,24.58,0,0,0,7.55-1.15A19.34,19.34,0,0,0,148.11,77a16.27,16.27,0,0,0,4.37-5.5,16.91,16.91,0,0,0,1.63-7.58A18.5,18.5,0,0,0,152.43,55.67ZM145,68.6A8.8,8.8,0,0,1,142.36,72a10.7,10.7,0,0,1-4,1.82,21.57,21.57,0,0,1-5,.55h-4.05v-21h4.6a17,17,0,0,1,4.67.63,11.66,11.66,0,0,1,3.88,1.87A9.14,9.14,0,0,1,145,59a9.87,9.87,0,0,1,1,4.52A11.89,11.89,0,0,1,145,68.6Zm44.63-.13a8,8,0,0,0-1.58-2.62A8.38,8.38,0,0,0,185.63,64a10.31,10.31,0,0,0-3.17-1v-.1a9.22,9.22,0,0,0,4.42-2.82,7.43,7.43,0,0,0,1.68-5,8.42,8.42,0,0,0-1.15-4.65,8.09,8.09,0,0,0-3-2.72,12.56,12.56,0,0,0-4.18-1.3,32.84,32.84,0,0,0-4.62-.33h-13.2v35.4h14.5a22.41,22.41,0,0,0,4.72-.5,13.53,13.53,0,0,0,4.28-1.65,9.42,9.42,0,0,0,3.1-3,8.52,8.52,0,0,0,1.2-4.68A9.39,9.39,0,0,0,189.66,68.47ZM170.21,52.72h5.3a10,10,0,0,1,1.85.18,6.18,6.18,0,0,1,1.7.57,3.39,3.39,0,0,1,1.22,1.13,3.22,3.22,0,0,1,.48,1.82,3.63,3.63,0,0,1-.43,1.8,3.4,3.4,0,0,1-1.12,1.2,4.92,4.92,0,0,1-1.58.65,7.51,7.51,0,0,1-1.77.2h-5.65Zm11.72,20a3.9,3.9,0,0,1-1.22,1.3,4.64,4.64,0,0,1-1.68.7,8.18,8.18,0,0,1-1.82.2h-7v-8h5.9a15.35,15.35,0,0,1,2,.15,8.47,8.47,0,0,1,2.05.55,4,4,0,0,1,1.57,1.18,3.11,3.11,0,0,1,.63,2A3.71,3.71,0,0,1,181.93,72.72Z" />
                </g>
              </g>
            </svg>
          </div>
        </div>
        {user.isLoading && <Loading />}
        {user.isError && <GuestGreeting />}
        {user.isSuccess && <UserGreeting email={user.data.email} />}
      </div>
    </>
  );
};

export default Navbar;
