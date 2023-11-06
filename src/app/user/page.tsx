import Header from "../../components/PageHeader";
import Loading from "../../components/ui/Loading";
import { getUser } from "../lib/UserActions";
import UserModal from "./UserModal";

async function User() {
  const user = await getUser();
  if (!user) return <Loading />;
  return (
    <>
      <UserModal email={user.email} name={user.name} />
      <div className="flex w-full flex-1 flex-col px-5 md:px-20">
        <Header
          type="Profile"
          data={{
            name: user.name ?? user.email,
            picture:
              "https://images.unsplash.com/photo-1666844550308-9b47df48af49?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
          }}
          isOwner={true}
        />
        <div></div>
      </div>
    </>
  );
}

export default User;
