import "../globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextPage } from "next";
import { ReactElement, ReactNode } from "react";
import UserProvider from "../context/UserProvider";
import Layout from "../components/Layout";
import LikedWordsProvider from "../context/LikedWordsProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LikedWordsProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LikedWordsProvider>
      </UserProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default MyApp;
