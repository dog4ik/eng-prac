"use client";
import { useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import Input from "../../components/ui/Input";
type Props = {
  name: string | null;
  email: string;
};
export default function UserModal({ name, email }: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  if (isOpen)
    return (
      <div
        className="fixed left-0 top-0 z-20 flex h-screen w-screen animate-fade-in overflow-hidden bg-neutral-900/75"
        onMouseDown={() => setIsOpen(false)}
      >
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="relative m-auto flex h-auto min-h-full w-full max-w-md animate-fade-in flex-col gap-5 rounded-xl bg-white px-0 py-0 dark:bg-neutral-700 dark:text-white md:min-h-fit"
        >
          <FiX
            className="absolute right-3 top-3 cursor-pointer place-self-end self-end"
            size={27}
            onClick={() => setIsOpen(false)}
          />

          <div className="mx-5 overflow-x-hidden">
            <h1 className="my-5 text-xl ">User info</h1>
            <form className=" flex flex-col gap-4 ">
              <Input
                label="Name"
                ref={nameRef}
                id="name"
                type="text"
                defaultValue={name ?? ""}
              />
              <Input
                label="Email"
                required
                ref={emailRef}
                id="email"
                type="email"
                defaultValue={email}
              />
            </form>
            <div className="my-5 flex flex-col justify-around gap-3 px-4 md:flex-row">
              <button
                className="w-full rounded-xl bg-gray-100 px-16 py-3 font-bold text-black md:w-auto"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button className="w-full rounded-xl bg-black px-16 py-3 font-bold text-white md:w-auto">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  else return <button onClick={() => setIsOpen(true)}>Open</button>;
}
