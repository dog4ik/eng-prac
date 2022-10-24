import { User } from "@prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect, useRef } from "react";
import Input from "../components/ui/Input";
import test, { emailEx, passwordEx } from "../utils/TestInput";

const SignUp = () => {
  const router = useRouter();
  const signupMutation = useMutation(
    (data: { email?: string; password?: string }) => {
      return axios.post(
        process.env.NEXT_PUBLIC_API_LINK + "/users/create",
        data
      );
    },
    {
      onSuccess: (data) => {
        if (typeof window != "undefined") {
          localStorage.setItem("access_token", data.data.access_token);
          localStorage.setItem("refresh_token", data.data.refresh_token);
        }
        router.push("/");
      },
      onError: async (err) => {
        console.log(err);
        email.current!.style.borderColor = "red";
      },
    }
  );
  const password = useRef<HTMLInputElement>(null);
  const r_password = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);
  const handleSubmit = () => {
    if (passwordTest() && test(emailEx, email) && test(passwordEx, password)) {
      signupMutation.mutate({
        email: email.current?.value,
        password: password.current?.value,
      });
    } else {
      passwordTest();
      test(emailEx, email);
      test(passwordEx, password);
    }
  };

  function passwordTest() {
    if (password.current?.value != r_password.current?.value) {
      r_password.current!.style.borderColor = "red";
      return false;
    } else {
      return true;
    }
  }
  const Loading = () => {
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

  return (
    <div className="flex justify-center items-center">
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
              ref={email}
              onChange={() => {
                email.current!.style.borderColor = "";
                test(emailEx, email);
              }}
              label="Email"
              required
              type="email"
              autoComplete="email"
              id="email"
            ></Input>
            <Input
              ref={password}
              onChange={() => {
                password.current!.style.borderColor = "";
                test(passwordEx, password);
              }}
              label="Password"
              required
              type="password"
              autoComplete="password"
              id="password"
            ></Input>
            <Input
              ref={r_password}
              onChange={() => {
                r_password.current!.style.borderColor = "";
                passwordTest();
              }}
              label="Repeat Password"
              required
              type="password"
              autoComplete="password"
              id="password"
            ></Input>
            {signupMutation.isLoading ? (
              <Loading />
            ) : (
              <button type="submit" className="p-2 rounded-xl bg-green-600">
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
