import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import axios from "axios";
import React, { ReactElement, useContext, useRef, useState } from "react";
import Layout from "../components/Layout";
import Input from "../components/ui/Input";
import test, { emailEx, passwordEx } from "../utils/TestInput";
import Link from "next/link";
import { User, useUser } from "../utils/useUser";

const Login = () => {
  const [token, setToken] = useState(null);
  const router = useRouter();
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  useQuery(
    ["userdata"],
    async (): Promise<User> => {
      return await axios
        .get("http://localhost:3000/api/users/credentials", {
          headers: {
            Authorization: "Bearer " + token,
          },
        })
        .then((data) => data.data);
    },
    {
      enabled: !!token,
    }
  );
  const mutation = useMutation(
    (data: { email: string | undefined; password: string | undefined }) => {
      return axios.post(
        process.env.NEXT_PUBLIC_API_LINK + "/users/login",
        data
      );
    },
    {
      async onSuccess(data) {
        console.log("successful login");
        localStorage.setItem("access_token", data.data.access_token);
        localStorage.setItem("refresh_token", data.data.refresh_token);
        setToken(data.data.access_token);
        router.push("/");
      },
      onError(err) {
        console.log("error");
        email.current!.style.borderColor = "red";
        console.log(err);
      },
    }
  );

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
          <h1 className="text-3xl">Login</h1>
        </div>
        <div>
          <form
            method="post"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                email: email.current?.value,
                password: password.current?.value,
              });
            }}
            className="flex flex-col gap-5"
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
              autoComplete="username"
            ></Input>
            <Input
              ref={password}
              label="Password"
              required
              type="password"
              autoComplete="current-password"
              name="password"
            ></Input>
            {mutation.isLoading ? (
              <Loading />
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
