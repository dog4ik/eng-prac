import { useNotifications } from "../components/context/NotificationCtx";
import { trpc } from "./trpc";

const useLikeMutaton = () => {
  const queryClient = trpc.useContext();
  const notificator = useNotifications();

  return trpc.words.like.useMutation({
    async onMutate(variable) {
      await queryClient.words.getLikes.cancel();
      const snapShot = queryClient.words.getLikes.getData();
      queryClient.words.getLikes.setData(undefined, (old) => {
        return [
          ...(old ?? []),
          ...variable.map((item) => ({
            eng: item.eng,
            rus: item.rus ?? "",
            createdAt: new Date(),
            id: "I shouldn't exist and I need to be invalidated",
          })),
        ];
      });
      return { snapShot };
    },
    async onError(err, _, context) {
      queryClient.words.getLikes.setData(undefined, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to like words" });
      else notificator({ type: "error", message: "Failed to like word" });
    },
    async onSettled() {
      queryClient.words.getLikes.invalidate();
    },
  });
};
const useUnLikeMutation = () => {
  const queryClient = trpc.useContext();
  const notificator = useNotifications();

  return trpc.words.unLike.useMutation({
    async onMutate(variables) {
      queryClient.words.getLikes.cancel();
      const snapShot = queryClient.words.getLikes.getData();
      queryClient.words.getLikes.setData(undefined, (old) =>
        old?.filter(
          (item) => !variables.map((item) => item.eng).includes(item.eng)
        )
      );
      return { snapShot };
    },
    onError(err, _, context) {
      queryClient.words.getLikes.setData(undefined, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to like words" });
      else notificator({ type: "error", message: "Failed to unlike" });
    },
    async onSettled() {
      //queryClient.words.getLikes.invalidate();
    },
  });
};

export { useLikeMutaton, useUnLikeMutation };
