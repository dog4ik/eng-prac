import { useRouter } from "next/router";
import Image from "next/image";
import React, { useRef } from "react";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";
import useClose from "../../utils/useClose";
import useToggle from "../../utils/useToggle";
import Input from "../ui/Input";
import { trpc } from "../../utils/trpc";
import { useNotifications } from "../context/NotificationCtx";
import Loading from "../ui/Loading";
type ModalProps = {
  handleClose: () => void;
  id: string;
};
const EditWordbookModal = ({ handleClose, id }: ModalProps) => {
  const [open, setOpen] = useClose(handleClose, 200);
  const notificator = useNotifications();
  const router = useRouter();
  const queryClient = trpc.useContext();
  const nameRef = useRef<HTMLInputElement>(null);
  const wordbookQuery = trpc.words.getWordbook.useQuery({ id });
  const [isPrivate, setIsPrivate] = useToggle(
    wordbookQuery.data?.private ?? false
  );
  const deleteMutation = trpc.words.deleteWordbook.useMutation({
    async onSuccess() {
      notificator({ type: "success", message: "Wordbook deleted" });
    },
    async onMutate() {
      await queryClient.words.getAllWordbooks.cancel();
      const snapShot = queryClient.words.getAllWordbooks.getData();
      queryClient.words.getAllWordbooks.setData(undefined, (old) => {
        return old?.filter((item) => item.id != id);
      });
      return { snapShot };
    },
    async onError(err, _, context) {
      queryClient.words.getAllWordbooks.setData(undefined, context?.snapShot);
      if (err.data?.code == "UNAUTHORIZED")
        notificator({ type: "error", message: "Login to delete wordbooks" });
      else notificator({ type: "error", message: "Failed to delete wordbook" });
    },
    async onSettled() {
      queryClient.words.getAllWordbooks.invalidate();
    },
  });
  const editMutation = trpc.words.editWordbook.useMutation({
    onSuccess() {
      queryClient.words.getWordbook.invalidate({ id });
      queryClient.words.getAllWordbooks.invalidate();
      notificator({ type: "success", message: "Wordbook edited" });
      setOpen();
    },
  });
  return (
    <div
      onClick={() => setOpen()}
      className={`fixed top-0 left-0 z-20 flex h-screen w-screen items-center justify-center backdrop-blur-sm backdrop-filter transition-opacity duration-200 ${
        open ? "animate-fade-in" : "opacity-0"
      } `}
    >
      <div
        className=" relative flex w-full max-w-lg flex-col rounded-2xl bg-neutral-900 py-5 "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => setOpen()}
        />
        <p className="px-5 pb-1 text-3xl">Edit wordbook</p>
        {wordbookQuery.isLoading && (
          <div className="h-52 w-52">
            <Loading />
          </div>
        )}
        {wordbookQuery.isSuccess && (
          <div className="flex w-full justify-evenly gap-2 self-center">
            <div className="relative h-52 w-52 shrink-0">
              <Image
                src="https://images.unsplash.com/photo-1667163589961-5d1f2a74b410?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
                alt="placeholder"
                height={300}
                width={300}
                className="aspect-square cursor-pointer object-cover object-center shadow-xl drop-shadow-2xl"
                priority
              />
            </div>
            <div className="flex flex-col justify-between gap-5 py-1">
              <Input
                label="Name"
                defaultValue={wordbookQuery.data.name}
                ref={nameRef}
              />
              <div className="flex items-center justify-between gap-3">
                <p>Is private:</p>
                <div
                  onClick={() => setIsPrivate()}
                  className="flex h-6 w-12 cursor-pointer rounded-full bg-white"
                >
                  <div
                    className={`flex h-full w-1/2 items-center justify-center rounded-full bg-green-400 transition duration-100 ${
                      isPrivate ? `translate-x-6` : ""
                    }`}
                  >
                    {isPrivate ? (
                      <FiLock className="stroke-black" />
                    ) : (
                      <FiUnlock className="stroke-black " />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-5">
                <button
                  className="rounded-xl bg-red-500 p-2"
                  onClick={async () => {
                    deleteMutation.mutate({ id });
                    handleClose();
                    await router.replace("/wordbooks");
                    //TODO: firgure out better way not to update instantly after reroute
                    queryClient.words.getAllWordbooks.cancel();
                  }}
                >
                  Delete
                </button>
                <button
                  className="rounded-xl bg-green-500 p-2"
                  onClick={() =>
                    editMutation.mutate({
                      isPrivate: isPrivate,
                      name: nameRef.current?.value ?? "",
                      id,
                    })
                  }
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditWordbookModal;
