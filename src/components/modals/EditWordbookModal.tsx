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
      className={`fixed top-0 left-0 h-screen w-screen backdrop-filter backdrop-blur-sm z-20 flex justify-center items-center duration-200 transition-opacity ${
        open ? "animate-fade-in" : "opacity-0"
      } `}
    >
      <div
        className=" py-5 max-w-lg w-full relative bg-neutral-900 rounded-2xl flex flex-col "
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <FiX
          className="absolute top-5 right-5 cursor-pointer"
          size={35}
          onClick={() => setOpen()}
        />
        <p className="text-3xl px-5 pb-1">Edit wordbook</p>
        <div className="flex justify-evenly self-center w-full gap-2">
          <div className="w-52 h-52  shrink-0 relative">
            <Image
              src="https://images.unsplash.com/photo-1667163589961-5d1f2a74b410?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
              alt="placeholder"
              height={300}
              width={300}
              className="aspect-square drop-shadow-2xl shadow-xl object-cover object-center cursor-pointer"
              priority
            />
          </div>
          <div className="flex gap-5 flex-col justify-between py-1">
            <Input label="Name" defaultValue={query.data?.name} ref={nameRef} />
            <div className="flex gap-3 items-center justify-between">
              <p>Is private:</p>
              <div
                onClick={() => setIsPrivate()}
                className="w-12 h-6 flex bg-white rounded-full cursor-pointer"
              >
                <div
                  className={`h-full flex justify-center items-center rounded-full transition duration-100 bg-green-400 w-1/2 ${
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
                className="p-2 rounded-xl bg-red-500"
                onClick={() => deleteMutation.mutate()}
              >
                Delete
              </button>
              <button
                className="p-2 rounded-xl bg-green-500"
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
