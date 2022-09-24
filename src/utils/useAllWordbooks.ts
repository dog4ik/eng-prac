import { useQuery } from "@tanstack/react-query";
import authApi from "./authApi";
import { Book } from "./useWordbook";

const fetchAllWordbooks = async (): Promise<Book[]> =>
  (await authApi.get("/wordbooks")).data;

const useAllWordbooks = () => {
  return useQuery(["get-wordbooks"], () => fetchAllWordbooks());
};

export { useAllWordbooks, fetchAllWordbooks };
