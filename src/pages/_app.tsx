import "../globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpc } from "../utils/trpc";
import NotificationCtxProvider from "../components/context/NotificationCtx";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <NotificationCtxProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </NotificationCtxProvider>
  );
}

export default trpc.withTRPC(MyApp);
