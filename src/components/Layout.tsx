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
      <div className="flex min-h-screen max-h-screen overflow-hidden flex-col bg-neutral-800 text-white">
        <Navbar />
        <main className="flex relative md:max-h-[clac(100vh-80px))] overflow-y-auto md:mt-20 flex-1 flex-col bg-neutral-800">
          {children}
        </main>
        <NavMob />
      </div>
    </>
  );
};

export default Layout;
