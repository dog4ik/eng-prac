import Head from "next/head";
import React, { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
type Props = {
  children: ReactNode;
};
const Layout = ({ children }: Props) => {
  return (
    <>
      <div className="flex h-full flex-col dark:bg-neutral-800 dark:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col px-10 dark:bg-neutral-800">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout;
