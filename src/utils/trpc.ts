import { httpBatchLink } from "@trpc/client";
import { retryLink } from "./retryLink";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
import type { AppRouter } from "../server/root";
import axios from "axios";
const getRefresh_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  } else return null;
};
const getAccess_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  } else return null;
};
const authApi = axios.create(
  getAccess_token()
    ? {
        baseURL: process.env.NEXT_PUBLIC_API_LINK,
        headers: {
          Authorization: "Bearer " + getAccess_token(),
        },
      }
    : {
        baseURL: process.env.NEXT_PUBLIC_API_LINK,
      }
);

async function refreshToken() {
  return authApi
    .post("/users/refresh", {
      refresh_token: getRefresh_token(),
    })
    .then(async (res) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", res.data.access_token);
      }
    });
}
function getBaseUrl() {
  if (typeof window !== "undefined")
    // browser should use relative path
    return "";

  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;

  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      transformer: superjson,
      links: [
        retryLink({
          attempts: 1,
          async onError(err) {
            if (err.data.code === "UNAUTHORIZED") {
              await refreshToken().catch(() => {
                //Remove tokens if can't refresh it
                if (typeof window != "undefined") {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                }
              });
            }
          },
        }),
        httpBatchLink({
          /**
           * If you want to use SSR, you need to use the server's full URL
           * @link https://trpc.io/docs/ssr
           **/
          url: `${getBaseUrl()}/api/trpc`,
          headers() {
            if (getAccess_token())
              return {
                Authorization: `Bearer ${getAccess_token()}`,
              };
            return {};
          },
        }),
      ],

      /**
       * @link https://tanstack.com/query/v4/docs/reference/QueryClient
       **/
      queryClientConfig: {
        defaultOptions: {
          queries: { retry: false, refetchOnWindowFocus: false },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/

  ssr: false,
});
