"use client";
import Link from "next/link";
import { FallbackProps } from "react-error-boundary";

export default function GuestGreeting({ error }: FallbackProps) {
  console.log("error boundary state: ", error);
  return (
    <div className="flex h-2/3 animate-fade-in items-center justify-center">
      <Link
        href={"/signup"}
        className="rounded-xl px-5 py-1 text-lg text-white/75 transition duration-75 hover:scale-105 hover:font-semibold hover:text-white sm:px-10 sm:py-2"
      >
        Sign up
      </Link>
      <Link
        href={"/login"}
        className="rounded-full bg-white px-5 py-1 text-lg text-black transition duration-75 hover:scale-105 sm:px-10 sm:py-2"
      >
        Login
      </Link>
    </div>
  );
}
