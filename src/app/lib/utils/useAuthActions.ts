"use client";
import { use } from "react";
import { ActionPayload } from "../actions/ActionPayload";
import refreshTokenAction from "../actions/refreshToken";
import { AuthQueryType } from "./authAction";

function getRefreshToken() {
  return typeof localStorage == "undefined"
    ? null
    : localStorage.getItem("refresh_token");
}

export function useAuthQuery<T>(query: AuthQueryType<ActionPayload<T>>) {
  let result = use(query.pending);
  if (result.type == "error" && result.error.type != "expired") {
    console.log("unusual error: ", result);
  }
  if (result.error?.type == "expired") {
    console.log("running expired scenario in query");
    use(
      refreshTokenAction(getRefreshToken()!).then(async () => {
        result = await query.action();
      }),
    );
  }
  return result.data!;
}

export function useAuthMutation<T extends ActionPayload<T["data"]>>(
  mutation: (...args: unknown[]) => Promise<T>,
) {
  return async (...args: any[]) => {
    let result = await mutation(...args);
    if (result.type == "error" && result.error.type == "expired") {
      console.log("running expired scenario in mutation");
      result = await refreshTokenAction(getRefreshToken()!).then(
        async () => await mutation(...args),
      );
    }
    if (result.type == "error") {
      throw result.error.type;
    } else {
      return result.data!;
    }
  };
}
