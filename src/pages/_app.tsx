import "../globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import UserProvider from "../context/UserProvider";
import Layout from "../components/Layout";
import LikedWordsProvider from "../context/LikedWordsProvider";

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();
  console.log(process.env.NEXT_PUBLIC_API_LINK);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LikedWordsProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LikedWordsProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
