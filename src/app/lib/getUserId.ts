import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { TokenExpiredError, NotFoundError } from "./actions/errors";

export async function getUserIdWithRedirect() {
  let headersList = headers();
  const pathname = headersList.get("x-invoke-path");
  let userId = headersList.get("user_id");
  if (!userId) {
    redirect(pathname ? `/login?from=${pathname}` : "/login");
  }
  return userId;
}

export function tryGetUserId() {
  let headersList = headers();
  let userId = headersList.get("user_id");
  if (headersList.has("auth-expired")) {
    throw new TokenExpiredError();
  }
  if (!userId) throw new NotFoundError();
  return userId;
}
