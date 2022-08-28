import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query";
import React, { createContext, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
type Props = {
  children: ReactNode;
};
type User = {
  name: string;
  email: string;
  role: string;
  id: string;
  notifications: string;
};
type UserContext = {
  user?: User;
  islogged?: boolean;
  query?: UseQueryResult<AxiosResponse<User, any>, Error>;
  authApi?: AxiosInstance;
  logout: () => void;
};
const GetAccess_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  } else return null;
};
const GetRefresh_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  } else return null;
};
export const UserContext = createContext({} as UserContext);

const UserProvider = ({ children }: Props) => {
  const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_LINK,
    headers: {
      Authorization: "Bearer " + GetAccess_token(),
    },
  });
  const [islogged, setIslogged] = useState(false);
  const [user, setUser] = useState<User>();
  const router = useRouter();
  authApi.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      if (
        error.response.status == 401 &&
        error.response.data == "jwt expired"
      ) {
        console.log(error);

        console.log("Refreshing token");
        return refreshToken().then(() => {
          error.config.headers["Authorization"] = "Bearer " + GetAccess_token();
          return axios.request(error.config);
        });
      }
      return Promise.reject(error);
    }
  );
  const getUser = async () => {
    return authApi.get("/users/credentials");
  };
  const query = useQuery<AxiosResponse<User>, Error>(["userdata"], getUser, {
    retry: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      setUser(data.data);
      setIslogged(true);
    },
    onError: async (err: any) => {
      setIslogged(false);
      console.log(err);

      console.log("error");
    },
  });
  function login() {}
  function logout() {
    if (typeof window != "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(undefined);
      setIslogged(false);
      router.push("/");
    }
  }
  async function refreshToken() {
    return await authApi
      .post(process.env.NEXT_PUBLIC_API_LINK + "/users/refresh", {
        refresh_token: GetRefresh_token(),
      })
      .then(async (res) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", res.data.access_token);
        }
      });
  }

  useEffect(() => {}, []);

  return (
    <UserContext.Provider value={{ user, islogged, query, authApi, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
