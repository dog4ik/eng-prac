import Link from "next/link";

const UnauthorizedError = () => {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4">
      <span className="text-2xl font-semibold">
        Login or Register to view this page
      </span>
      <div className="flex items-center justify-center gap-3">
        <Link
          className="rounded-xl bg-white px-4 py-2 text-xl text-black"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="rounded-xl bg-green-400 py-2 px-4 text-xl text-white"
          href="/signup"
        >
          Register
        </Link>
      </div>
    </div>
  );
};
export default UnauthorizedError;
