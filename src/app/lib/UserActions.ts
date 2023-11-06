"use server";

import { cookies } from "next/headers";

export async function logoutUser() {
  let cookiesList = cookies();
  cookiesList.delete("access_token");
  cookiesList.delete("refresh_token");
}
