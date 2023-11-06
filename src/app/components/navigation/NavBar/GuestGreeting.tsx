"use client";
import Link from "next/link";

export default function GuestGreeting() {
  return (
    <div className="flex h-2/3 animate-fade-in items-center justify-center">
      <Link href={"/signup"}>
        <button className="rounded-xl px-5 py-1 text-lg text-white/75 transition duration-75 hover:scale-105 hover:font-semibold hover:text-white sm:px-10 sm:py-2">
          Sign up
        </button>
      </Link>
      <Link href={"/login"}>
        <button className="rounded-full bg-white px-5 py-1 text-lg text-black transition duration-75 hover:scale-105 sm:px-10 sm:py-2">
          Login
        </button>
      </Link>
    </div>
  );
}
