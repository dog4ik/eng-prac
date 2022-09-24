import { useQuery } from "@tanstack/react-query";
import authApi from "./authApi";

export type User = {
  name: string;
  email: string;
  role: string;
  id: string;
  notifications: string;
};

const fetchUser = async (): Promise<User> => {
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
