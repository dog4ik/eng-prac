"use client";

import Link from "next/link";
import FormProgressButton from "../components/ui/FormProgressButton";
import Input from "../components/ui/Input";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  handleLogin: (data: FormData) => Promise<{ refresh_token?: string }>;
};

export default function LoginForm({ handleLogin }: Props) {
  let searchParams = useSearchParams();
  let router = useRouter();
  async function loginAction(data: FormData) {
    let { refresh_token } = await handleLogin(data);
    if (!refresh_token) {
      return;
    }
    localStorage.setItem("refresh_token", refresh_token);
    let fromUrl = searchParams.get("from");
    window.location.assign(fromUrl || "/");
  }

  return (
    <form action={loginAction} className="flex flex-col gap-5">
      <Input
        label="Email"
        name="email"
        required
        type="email"
        autoComplete="username"
      />
      <Input
        label="Password"
        required
        type="password"
        autoComplete="current-password"
        name="password"
      />
      <FormProgressButton title="Login" />
      <Link
        href={"/signup"}
        className="text-center font-semibold text-blue-600"
      >
        Register
      </Link>
    </form>
  );
}
