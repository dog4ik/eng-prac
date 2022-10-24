import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import authApi from "./authApi";

export type Word = {
  id: string;
  eng: string;
  rus: string;
  createdAt: Date;
};
export type Book = {
  private: boolean;
  createdAt: Date;
  id: string;
  userId?: string;
  name: string;
  description?: string;
  words: Word[];
};

const fetchWordbook = async (id?: string | string[]): Promise<Book> => {
  const result = (await authApi.get("/wordbooks/" + id)).data;
  console.log(result);
  return result;
};

const useWordbook = (id?: string | string[]) => {
  return useQuery(["wordbook", id], () => fetchWordbook(id), {
    refetchOnWindowFocus: false,
  });
};
const RemoveWordMutation = (id?: string[] | string) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (word: { word?: string[] }) => {
      return await authApi.delete("/wordbooks/words/" + id, {
        data: word,
      });
    },
    {
      async onMutate(variables) {
        await queryClient.cancelQueries(["wordbook", id]);
        const snapShot = await queryClient.getQueryData(["wordbook", id]);
        queryClient.setQueryData<Book>(["wordbook", id], (old) => {
          old!.words = old!.words!.filter(
            (item) => !variables.word?.includes(item.eng)
          );

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

export { useWordbook, fetchWordbook, RemoveWordMutation };
