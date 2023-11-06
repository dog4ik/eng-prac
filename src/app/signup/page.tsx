import Input from "../components/ui/Input";
import bcrypt from "bcrypt";
import prisma from "../../../prisma/PrismaClient";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { signAccessToken, signRefreshToken } from "../lib/JWTUtils";
import FormProgressButton from "../components/ui/FormProgressButton";

async function createUser(formData: FormData) {
  "use server";
  let cookiesList = cookies();
  let headersList = headers();
  headersList.set("Cache-Contol", "no-store");
  let password = formData.get("password")?.toString();
  let email = formData.get("email")?.toString();
  let repeatPassword = formData.get("repeat_password")?.toString();
  let validatedEmail = z.string().email().max(40).safeParse(email);
  let validatedPassword = z.string().min(8).max(40).safeParse(password);
  let validatedRepeatPassword = z
    .string()
    .min(8)
    .max(40)
    .safeParse(repeatPassword);
  if (!password || !email || !repeatPassword) return;
  if (
    !validatedRepeatPassword.success ||
    !validatedPassword.success ||
    !validatedEmail.success
  )
    return;

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email,
      password: passwordHash,
    },
  });

  const access_token = await signAccessToken(user.id);
  const refresh_token = await signRefreshToken(user.id);

  cookiesList.set("access_token", access_token);
  cookiesList.set("refresh_token", refresh_token);
  redirect("/");
}

function SignUp() {
  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-5">
        <div className="flex justify-center">
          <h1 className="text-3xl">Create new account</h1>
        </div>
        <div>
          <form className="flex flex-col gap-5" action={createUser}>
            <Input
              label="Email"
              required
              type="email"
              name="email"
              autoComplete="email"
            />
            <Input
              label="Password"
              required
              type="password"
              name="password"
              autoComplete="new-password"
            />
            <Input
              label="Repeat Password"
              required
              name="repeat_password"
              type="password"
              autoComplete="new-password"
            />
            <FormProgressButton title="Register" />
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
