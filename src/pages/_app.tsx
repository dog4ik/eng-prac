import "../globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { trpc } from "../utils/trpc";
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default trpc.withTRPC(MyApp);
