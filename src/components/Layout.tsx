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
      <div className="flex min-h-screen max-h-screen overflow-hidden flex-col bg-neutral-800 text-white">
        <Navbar />
        <main className="flex overflow-y-auto md:mt-20 md:ml-16 flex-1 flex-col bg-neutral-800 ">
          {children}
        </main>
        <NavMob />
      </div>
    </>
  );
};

export default Layout;
