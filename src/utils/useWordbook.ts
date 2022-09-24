import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import authApi from "./authApi";

export type Word = {
  eng: string;
  rus: string;
  date: string;
};
export type Book = {
  private: boolean;
  id: string;
  name: string;
  description?: string;
  words?: Array<Word>;
};

const fetchWordbook = async (id?: string | string[]): Promise<Book> =>
  (await authApi.get("/wordbooks/" + id)).data;

const useWordbook = (id?: string | string[]) => {
  return useQuery(["wordbook", id], () => fetchWordbook(id), {
    refetchOnWindowFocus: false,
  });
};
const removeWordMutation = (
  queryClient: QueryClient,
  id?: string[] | string
) => {
  return useMutation(
    async (word: { word?: string }) => {
      return await authApi.delete("/wordbooks/words/" + id, {
        data: word,
      });
    },
    {
      async onMutate(variables) {
        await queryClient.cancelQueries(["wordbook", id]);
        const snapShot = await queryClient.getQueryData(["wordbook", id]);
        queryClient.setQueryData<Book>(["wordbook", id], (old) => {
          old!.words = old!.words!.filter((item) => item.eng != variables.word);
          return old;
        });
        return { snapShot };
      },
      onError(err, newlike, context) {
        queryClient.setQueryData(["wordbook", id], context?.snapShot);
        console.log("unlike Error");
      },
      async onSettled() {
        // await queryClient.invalidateQueries(["wordbook", props.id]);
      },
    }
  );
};

export { useWordbook, fetchWordbook, removeWordMutation };
