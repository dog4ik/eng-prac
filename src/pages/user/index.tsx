import { useMutation } from "@tanstack/react-query";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useRef } from "react";
import { FiX } from "react-icons/fi";
import Header from "../../components/PageHeader";
import Input from "../../components/ui/Input";
import Loading from "../../components/ui/Loading";
import authApi from "../../utils/authApi";
import useToggle from "../../utils/useToggle";
import { useUser } from "../../utils/useUser";
type Props = {
  handleClose: () => void;
  name?: string;
  email?: string;
};
// export const getServerSideProps: GetServerSideProps<{
//   id?: string | string[];
// }> = async (context) => {
//   const { id } = context.query;
//   return { props: { id } };
// };
const UserModal = ({ handleClose, name, email }: Props) => {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const updateMutation = useMutation(() => authApi.post("/"));
  return (
    <div
      className="fixed flex z-20 top-0 left-0 h-screen w-screen overflow-hidden bg-neutral-900/75 animate-fade-in"
      onMouseDown={handleClose}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="m-auto py-0 relative px-0 rounded-xl flex flex-col gap-5 w-full min-h-full md:min-h-fit dark:text-white max-w-md h-auto bg-white dark:bg-neutral-700 animate-fade-in"
      >
        <FiX
          className="absolute place-self-end top-3 right-3 self-end cursor-pointer"
          size={27}
          onClick={handleClose}
        />

        <div className="mx-5 overflow-x-hidden">
          <h1 className="text-xl my-5 ">User info</h1>
          <form className=" flex flex-col gap-4 ">
            <Input
              label="Name"
              ref={nameRef}
              id="name"
              type="text"
              defaultValue={name}
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
          <div className="flex flex-col md:flex-row px-4 my-5 gap-3 justify-around">
            <button
              className="py-3 px-16 w-full md:w-auto bg-gray-100 text-black font-bold rounded-xl"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button className="py-3 px-16 w-full md:w-auto bg-black text-white font-bold rounded-xl">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const User = () => {
  const user = useUser();
  const [toggleUser, setToggleUser] = useToggle(false);
  if (user.isLoading) return <Loading />;
  if (user.data)
    return (
      <>
        {toggleUser && (
          <UserModal
            email={user.data?.email}
            name={user.data?.name}
            handleClose={() => setToggleUser()}
          />
        )}

        <div className="w-full px-5 md:px-20 flex flex-col flex-1">
          <Header
            type="Profile"
            data={{
              name: user.data?.name ? user.data.name : user.data.email,
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
