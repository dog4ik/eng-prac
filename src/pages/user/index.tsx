import { useRef } from "react";
import { FiX } from "react-icons/fi";
import Header from "../../components/PageHeader";
import Error from "../../components/ui/Error";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";
import UnauthorizedError from "../../components/ui/UnauthorizedError";
import { trpc } from "../../utils/trpc";
import useToggle from "../../utils/useToggle";
type Props = {
  handleClose: () => void;
  name: string | null;
  email: string;
};
const UserModal = ({ handleClose, name, email }: Props) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  return (
    <div
      className="fixed top-0 left-0 z-20 flex h-screen w-screen animate-fade-in overflow-hidden bg-neutral-900/75"
      onMouseDown={handleClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="relative m-auto flex h-auto min-h-full w-full max-w-md animate-fade-in flex-col gap-5 rounded-xl bg-white py-0 px-0 dark:bg-neutral-700 dark:text-white md:min-h-fit"
      >
        <FiX
          className="absolute top-3 right-3 cursor-pointer place-self-end self-end"
          size={27}
          onClick={handleClose}
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
              className="w-full rounded-xl bg-gray-100 py-3 px-16 font-bold text-black md:w-auto"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button className="w-full rounded-xl bg-black py-3 px-16 font-bold text-white md:w-auto">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const User = () => {
  const userQuery = trpc.user.credentials.useQuery();
  const [toggleUser, setToggleUser] = useToggle(false);
  if (userQuery.isLoading) return <Loading />;
  if (userQuery.isError) {
    if (userQuery.error.data?.code === "UNAUTHORIZED")
      return <UnauthorizedError />;
    return <Error />;
  }
  return (
    <>
      {toggleUser && (
        <UserModal
          email={userQuery.data?.email}
          name={userQuery.data?.name}
          handleClose={() => setToggleUser()}
        />
      )}

      <div className="flex w-full flex-1 flex-col px-5 md:px-20">
        <Header
          type="Profile"
          data={{
            name: userQuery.data?.name
              ? userQuery.data.name
              : userQuery.data.email,
            picture:
              "https://images.unsplash.com/photo-1666844550308-9b47df48af49?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          }}
          isOwner={true}
          setEditModal={setToggleUser}
        />
        <div></div>
      </div>
    </>
  );
};

export default User;
