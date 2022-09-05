import Head from "next/head";
import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import NavMob from "./NavMob";
type Props = {
  children: ReactNode;
};
const Layout = ({ children }: Props) => {
  return (
    <>
      <div className="flex min-h-screen flex-col py-2 bg-neutral-800 text-white">
        <Navbar />
        <main className="flex w-full flex-1 flex-col px-5 md:px-20 bg-neutral-800">
          {children}
        </main>
        <NavMob />
      </div>
    </>
  );
};

export default Layout;
