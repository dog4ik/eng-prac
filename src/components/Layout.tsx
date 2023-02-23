import React, { ReactNode } from "react";
import Navbar from "./Navbar";
type Props = {
  children: ReactNode;
};
const Layout = ({ children }: Props) => {
  return (
    <>
      <div className="flex max-h-screen min-h-screen flex-col overflow-hidden bg-neutral-800 text-white">
        <Navbar />
        <main className="mt-20 flex flex-1 flex-col overflow-y-auto bg-neutral-800 md:ml-16 ">
          {children}
        </main>
      </div>
    </>
  );
};

export default Layout;
