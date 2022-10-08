import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import authApi from "./authApi";

export type User = {
  name: string;
  email: string;
  role: string;
  id: string;
};

const fetchUser = async (): Promise<User> => {
  if (typeof window != "undefined") {
    if (!localStorage.getItem("access_token")) {
      throw new AxiosError("No auth token");
    }
  }
  return (await authApi.get("/users/credentials")).data;
};
const useUser = () => {
  return useQuery(["userdata"], () => fetchUser(), {
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export { useUser, fetchUser };
