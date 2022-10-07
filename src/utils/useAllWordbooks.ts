import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Axios, AxiosError } from "axios";
import authApi from "./authApi";
import { useUser } from "./useUser";
import { Book } from "./useWordbook";

const fetchAllWordbooks = async (): Promise<Book[]> => {
  return (await authApi.get("/wordbooks")).data;
};

const useAllWordbooks = () => {
  const queryClient = useQueryClient();
  const userdata = useUser();
  if (userdata.isError) queryClient.setQueryData(["get-wordbooks"], null);
  return useQuery(["get-wordbooks"], () => fetchAllWordbooks(), {
    enabled: userdata.isSuccess,
  });
};

export { useAllWordbooks, fetchAllWordbooks };
