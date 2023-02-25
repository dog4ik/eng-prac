import React, { ReactNode } from "react";
import Navbar from "./Navbar";
type Props = {
  children: ReactNode;
};
const Layout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col overflow-y-auto bg-neutral-800 text-white md:ml-16 ">
        {children}
      </main>
    </>
  );
};

export default Layout;
