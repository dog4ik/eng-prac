import "./globals.css";
import NotificationCtxProvider from "./components/notifications/NotificationCtx";
import Navbar from "./components/navigation/NavBar";
import SideBar from "./components/navigation/SideBar";
import AuthCtxProvider from "./components/AuthCtx";

export const metadata = {
  title: "English Practice",
  description: "Project for learning English",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="flex flex-1 flex-col bg-neutral-800 text-white md:pl-16 ">
          <Navbar />
          <SideBar />
          <NotificationCtxProvider>
            <AuthCtxProvider>{children}</AuthCtxProvider>
          </NotificationCtxProvider>
        </main>
      </body>
    </html>
  );
}
