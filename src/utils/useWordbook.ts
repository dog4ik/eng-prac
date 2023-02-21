import { useNotifications } from "../components/context/NotificationCtx";
import { trpc } from "./trpc";
export type Word = {
  eng: string;
  rus: string;
  id: string;
  createdAt: Date;
};
export type Book = {
  likesCount: number;
  name: string;
  _count: {
    words: number;
  };
  id: string;
  createdAt: Date;
  description: string | null;
  likes: number;
  private: boolean;
};

const RemoveWordMutation = (id: string) => {
  const queryClient = trpc.useContext();
  const notificator = useNotifications();
  return trpc.words.removeWord.useMutation({
    async onMutate(variables) {
      await queryClient.words.getWordbook.cancel({ id });
      const snapShot = queryClient.words.getWordbook.getData({ id });
      queryClient.words.getWordbook.setData({ id }, (old) => {
        if (old)
          old.words = old.words.filter(
            (item) => !variables.wordsIds.includes(item.id)
          );

        return old;
      });
      return { snapShot };
    },
    onError(err, _, context) {
      queryClient.words.getWordbook.setData({ id }, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to remove words" });
      else notificator({ type: "error", message: "Cant delete words" });
    },
    async onSettled() {
      await queryClient.words.getWordbook.invalidate({ id });
    },
  });
};

export { RemoveWordMutation };
