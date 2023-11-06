"use client";
import { use, useRef } from "react";
import usePopout from "../../../../utils/usePopout";
import { useRouter } from "next/navigation";
import { FiChevronDown, FiChevronUp, FiLogOut, FiUser } from "react-icons/fi";
import Link from "next/link";
import { logoutUser } from "../../../lib/UserActions";
import { fetchUser } from "../../../lib/actions/authorized/user";
import { useAuthQuery } from "../../../lib/utils/useAuthActions";
import { ActionPayload } from "../../../lib/actions/ActionPayload";
import {
  AuthQueryReturnType,
  AuthQueryType,
} from "../../../lib/utils/authAction";

const Popout = () => {
  const router = useRouter();
  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    logoutUser();
    router.push("/");
    router.refresh();
  }
  return (
    <ul className="absolute right-0 top-6 z-10 w-60 animate-fade-in overflow-hidden rounded-xl bg-neutral-700">
      <Link href={"/user"}>
        <li className="flex h-16 cursor-pointer items-center gap-5 px-3 dark:hover:bg-neutral-500 ">
          <FiUser className="pointer-events-none" />
          <p className="text-center after:w-full after:border-b">Profile</p>
        </li>
      </Link>
      <li
        onClick={handleLogout}
        className="flex h-16 cursor-pointer items-center gap-5 px-3 dark:hover:bg-neutral-500"
      >
        <FiLogOut className="pointer-events-none" />
        <span className="text-center">Logout</span>
      </li>
    </ul>
  );
};

type Props = {
  userQuery: AuthQueryReturnType<typeof fetchUser>;
};

export default function userGreeting({ userQuery }: Props) {
  const userRef = useRef<HTMLDivElement>(null);
  const [profilePopout, setProfilePopout] = usePopout(userRef);
  let user = useAuthQuery(userQuery);
  console.log(user);
  return (
    <div className="flex animate-fade-in items-center justify-center gap-7">
      <div
        onClick={() => setProfilePopout()}
        ref={userRef}
        className="flex cursor-pointer select-none items-center justify-center gap-2 rounded-full bg-neutral-500 p-1"
      >
        <div className="rounded-full bg-neutral-800 p-1">
          <FiUser size={20} className="cursor-pointer dark:fill-white" />
        </div>
        <span className="hidden lg:block">{user.email}</span>
        {profilePopout ? (
          <FiChevronUp size={25} className="pointer-events-none" />
        ) : (
          <FiChevronDown size={25} className="pointer-events-none" />
        )}
        <div className="relative">{profilePopout && <Popout />}</div>
      </div>
    </div>
  );
}
