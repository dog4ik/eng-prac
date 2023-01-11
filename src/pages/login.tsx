import { useRouter } from "next/router";
import React, { useState } from "react";
import Input from "../components/ui/Input";
import Link from "next/link";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const LoadingBtn = () => {
  return (
    <button className="p-2 flex justify-center items-center rounded-xl bg-green-600 transition ease-in-out duration-150 cursor-not-allowed">
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Loading...
    </button>
  );
};
const Login = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const verifiedEmail = z.string().max(100).email().safeParse(email);
  const verifiedPassword = z.string().min(8).max(40).safeParse(password);
  const keys = trpc.user.credentials.getQueryKey();
  const loginMutation = trpc.user.login.useMutation({
    onSuccess(data) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      queryClient.invalidateQueries(keys);
      router.push("/");
    },
    onError(err) {
      console.log("error");
      console.log(err);
    },
  });
  const handleLogin = () => {
    if (!verifiedEmail.success) return;
    if (!verifiedPassword.success) return;
    loginMutation.mutate({
      email: verifiedEmail.data,
      password: verifiedPassword.data,
    });
  };
  return (
    <div className="flex justify-center items-center">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <h1 className="text-3xl">Login</h1>
        </div>
        <div>
          <form
            method="post"
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="flex flex-col gap-5"
          >
            <Input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              style={{
                borderColor: `${
                  (!verifiedEmail.success && email) || loginMutation.isError
                    ? "red"
                    : ""
                }`,
              }}
              label="Email"
              required
              type="email"
              autoComplete="username"
            ></Input>
            <Input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              label="Password"
              style={{
                borderColor: `${
                  !verifiedPassword.success && password ? "red" : ""
                }`,
              }}
              required
              type="password"
              autoComplete="current-password"
              name="password"
            ></Input>
            {loginMutation.isLoading ? (
              <LoadingBtn />
            ) : (
              <button type="submit" className="p-2 rounded-xl bg-green-600">
                Login
              </button>
            )}
            <Link
              href={"/signup"}
              className="text-center font-semibold text-blue-600"
            >
              Register
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
