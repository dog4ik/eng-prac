import { useRouter } from "next/router";
import React, { useState } from "react";
import Input from "../components/ui/Input";
import { trpc } from "../utils/trpc";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

const LoadingBtn = () => {
  return (
    <button className="flex cursor-not-allowed items-center justify-center rounded-xl bg-green-600 p-2 transition duration-150 ease-in-out">
      <svg
        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
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

const SignUp = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const keys = trpc.user.credentials.getQueryKey();
  const signupMutation = trpc.user.create.useMutation({
    onSuccess: (data) => {
      if (typeof window != "undefined") {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
      }
      queryClient.invalidateQueries(keys);
      router.push("/");
    },
    onError: async (err) => {
      console.log(err);
    },
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const validatedEmail = z.string().email().max(40).safeParse(email);
  const validatedPassword = z.string().min(8).max(40).safeParse(password);
  const validatedRepeatPassword = z
    .string()
    .min(8)
    .max(40)
    .safeParse(repeatPassword);
  const handleSubmit = () => {
    if (
      !validatedEmail.success ||
      !validatedPassword.success ||
      !validatedRepeatPassword.success
    )
      return;
    signupMutation.mutate({ password, email });
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <h1 className="text-3xl">Create new account</h1>
        </div>
        <div>
          <form
            method="post"
            className="flex flex-col gap-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <Input
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              style={{
                borderColor: `${
                  (!validatedEmail.success && email) || signupMutation.isError
                    ? "red"
                    : ""
                }`,
              }}
              label="Email"
              required
              type="email"
              name="email"
              autoComplete="email"
            ></Input>
            <Input
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              style={{
                borderColor:
                  !validatedPassword.success && password ? "red" : "",
              }}
              label="Password"
              required
              type="password"
              name="new-password"
              autoComplete="new-password"
            ></Input>
            <Input
              onChange={(e) => {
                setRepeatPassword(e.target.value);
              }}
              value={repeatPassword}
              style={{
                borderColor:
                  !validatedRepeatPassword.success &&
                  password &&
                  password !== repeatPassword
                    ? "red"
                    : "",
              }}
              label="Repeat Password"
              required
              name="repeat-password"
              type="password"
              autoComplete="new-password"
            ></Input>
            {signupMutation.isLoading ? (
              <LoadingBtn />
            ) : (
              <button type="submit" className="rounded-xl bg-green-600 p-2">
                Create
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
