import React, { ReactNode } from "react";
import Navbar from "./Navbar";
import NavMob from "./NavMob";
type Props = {
  children: ReactNode;
};
const Layout = ({ children }: Props) => {
  // const user = useUser();
  // if (user.isLoading) return <div></div>;
  return (
    <>
      <div className="flex max-h-screen min-h-screen flex-col overflow-hidden bg-neutral-800 text-white">
        <Navbar />
        <main className="flex flex-1 flex-col overflow-y-auto bg-neutral-800 md:mt-20 md:ml-16 ">
          {children}
        </main>
        <NavMob />
      </div>
    </>
  );
};

export default Layout;
