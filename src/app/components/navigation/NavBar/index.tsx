import { Suspense } from "react";
import UserGreeting from "./UserGreeting";
import { fetchUser } from "../../../lib/actions/authorized/user";
import { authQuery } from "../../../lib/utils/authAction";
import GuestGreeting from "./GuestGreeting";
import { ErrorBoundary } from "react-error-boundary";

function LoadingFallback() {
  return (
    <div className="flex h-10 w-60 animate-pulse rounded-full bg-neutral-100 p-1"></div>
  );
}

async function Navbar() {
  let user = authQuery(fetchUser);
  return (
    <div
      className="sticky top-0 z-20 flex h-full max-h-20 w-full flex-1 items-center justify-end gap-5 border-b
        border-neutral-700 bg-neutral-800 py-5 pr-2 text-white dark:bg-neutral-800 dark:text-white sm:pr-16 "
    >
      <ErrorBoundary fallback={<GuestGreeting />}>
        <Suspense fallback={<LoadingFallback />}>
          <UserGreeting userQuery={user} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default Navbar;
