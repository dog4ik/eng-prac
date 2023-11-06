import { ActionPayload } from "../actions/ActionPayload";
import { BaseError } from "../actions/errors";

export type AuthQueryType<T> = {
  action: () => Promise<T>;
  pending: Promise<T>;
};

export type AuthQueryReturnType<T extends (...args: any) => Promise<any>> =
  AuthQueryType<ActionPayload<Awaited<ReturnType<T>>>>;

export type AuthMutationReturnType<T extends (...args: any[]) => Promise<any>> =
  ActionPayload<Awaited<ReturnType<T>>>;

export async function serializeAction<T>(
  action: Promise<T>,
): Promise<ActionPayload<T>> {
  try {
    let result = await action;
    return { type: "success", data: result, error: undefined };
  } catch (e) {
    if (e instanceof BaseError) {
      return {
        type: "error",
        error: {
          type: e.type,
          message: e?.message,
        },
        data: undefined,
      };
    } else {
      console.log("unknown error", e);
      return {
        type: "error",
        error: {
          type: "unknown",
        },
        data: undefined,
      };
    }
  }
}

export function authQuery<T>(
  action: (...args: unknown[]) => Promise<T>,
): AuthQueryType<ActionPayload<T>> {
  let payload = async () => {
    "use server";
    return serializeAction(action());
  };
  return {
    action: payload,
    pending: payload(),
  };
}

export function authMutation<T>(action: Promise<T>) {
  return async () => {
    "use server";
    let result = await serializeAction(action);
    return result;
  };
}
