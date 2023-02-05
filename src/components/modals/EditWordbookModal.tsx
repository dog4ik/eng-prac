import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useRef } from "react";
import { FiLock, FiUnlock, FiX } from "react-icons/fi";
import authApi from "../../utils/authApi";
import useClose from "../../utils/useClose";
import useToggle from "../../utils/useToggle";
import { useWordbook } from "../../utils/useWordbook";
import Input from "../ui/Input";
type ModalProps = {
  handleClose: () => void;
  id?: string;
};
const EditWordbookModal = ({ handleClose, id }: ModalProps) => {
  const [open, setOpen] = useClose(handleClose, 200);
  const router = useRouter();
  const queryClient = useQueryClient();
  const query = useWordbook(id);
  const [isPrivate, setIsPrivate] = useToggle(query.data!.private);
  const nameRef = useRef<HTMLInputElement>(null);
  const deleteMutation = useMutation(
    () => {
      return authApi!.delete("wordbooks/" + id);
    },
    {
      async onSuccess() {
        await queryClient.invalidateQueries(["get-wordbooks"]);
        router.replace("/wordbooks");
      },
    }
  );
  const editMutation = useMutation(
    (data: { private: boolean; name: string }) => {
      return authApi!.patch("wordbooks/" + id, data);
    },
    {
      onSuccess() {
        queryClient.invalidateQueries(["wordbook", id]);
        setOpen();
      },
    }
  );
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
        <div className="flex w-full justify-evenly gap-2 self-center">
          <div className="relative h-52  w-52 shrink-0">
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
            <Input label="Name" defaultValue={query.data?.name} ref={nameRef} />
            <div className="flex items-center justify-between gap-3">
              <p>Is private:</p>
              <div
                onClick={() => setIsPrivate()}
                className="flex h-6 w-12 cursor-pointer rounded-full bg-white"
              >
                <div
                  className={`flex h-full w-1/2 items-center justify-center rounded-full bg-green-400 transition duration-100 ${
                    isPrivate ? `translate-x-6` : null
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
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </button>
              <button
                className="rounded-xl bg-green-500 p-2"
                onClick={() =>
                  editMutation.mutate({
                    private: isPrivate,
                    name: nameRef.current!.value,
                  })
                }
              >
                {"Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditWordbookModal;
