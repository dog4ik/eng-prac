import { z } from "zod";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/PrismaClient";
import { cookies } from "next/headers";
import { signAccessToken, signRefreshToken } from "../lib/JWTUtils";
import LoginForm from "./LoginForm";

async function handleLogin(formData: FormData) {
  "use server";
  let password = formData.get("password")?.toString();
  let email = formData.get("email")?.toString();
  let cookiesList = cookies();
  if (!password || !email) return {};
  const verifiedEmail = z.string().email().safeParse(email);
  const verifiedPassword = z.string().min(8).max(40).safeParse(password);
  if (!verifiedPassword.success || !verifiedEmail.success) return {};

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user === null) return {};

  if (await bcrypt.compare(password, user.password).catch(() => false)) {
    const [access_token, refresh_token] = await Promise.all([
      signAccessToken(user.id),
      signRefreshToken(user.id),
    ]);

    cookiesList.set("access_token", access_token, { httpOnly: true });
    return { refresh_token };
  } else {
    throw new Error(JSON.stringify({ code: "FORBIDDEN" }));
  }
}

function Login() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <h1 className="text-3xl">Login</h1>
        </div>
        <div>
          <LoginForm handleLogin={handleLogin} />
        </div>
      </div>
    </div>
  );
}

export default Login;
