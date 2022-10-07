import {
  QueryClient,
  Updater,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import authApi from "./authApi";
import { useUser } from "./useUser";
import { Word } from "./useWordbook";
const fetchLikes = async (): Promise<Word[]> => {
  return (await authApi.get("/wordbooks/words/likes")).data;
};
const useLikes = () => {
  const queryClient = useQueryClient();
  const userdata = useUser();
  if (userdata.isError) queryClient.setQueryData(["get-likes"], null);

  return useQuery(["get-likes"], () => fetchLikes(), {
    refetchOnWindowFocus: false,
    enabled: userdata.isSuccess,
  });
};
const useLikeMutaton = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (word: { eng?: string; rus?: string }) => {
      return await authApi.post("/wordbooks/words/likes", word);
    },
    {
      async onMutate(variable) {
        await queryClient.cancelQueries(["get-likes"]);
        const snapShot = await queryClient.getQueryData(["get-likes"]);
        queryClient.setQueryData<Word[]>(["get-likes"], (old: any) => [
          ...old,
          { eng: variable.eng, rus: variable.rus, date: Date.now() },
        ]);
        return { snapShot };
      },
      async onError(err, newlike, context) {
        queryClient.setQueryData(["get-likes"], context?.snapShot);
        console.log("like Error");
      },
      async onSettled() {
        // queryClient.invalidateQueries(["get-likes"]);
      },
    }
  );
};
const useUnLikeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (word: { eng?: string }) => {
      return authApi.delete("/wordbooks/words/likes", { data: word });
    },
    {
      async onMutate(variables) {
        await queryClient.cancelQueries(["get-likes"]);
        const snapShot = await queryClient.getQueryData(["get-likes"]);
        queryClient.setQueryData<Word[]>(["get-likes"], (old) =>
          old?.filter((item) => item.eng != variables.eng)
        );
        return { snapShot };
      },
      onError(err, newlike, context) {
        queryClient.setQueryData(["get-likes"], context?.snapShot);
        console.log("unlike Error");
      },
      async onSettled() {
        // await queryClient.invalidateQueries(["get-likes"]);
      },
    }
  );
};

export { useLikes, fetchLikes, useLikeMutaton, useUnLikeMutation };
