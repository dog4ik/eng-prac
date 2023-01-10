import Link from "next/link";

const UnauthorizedError = () => {
  return (
    <div className="w-full h-full flex-1 flex gap-4 flex-col justify-center items-center">
      <span className="text-2xl font-semibold">
        Login or Register to view this page
      </span>
      <div className="flex gap-3 justify-center items-center">
        <Link
          className="px-4 py-2 rounded-xl bg-white text-black text-xl"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="py-2 px-4 rounded-xl bg-green-400 text-white text-xl"
          href="/signup"
        >
          Register
        </Link>
      </div>
    </div>
  );
};
export default UnauthorizedError;
