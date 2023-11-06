export type ErrorType =
  | "expired"
  | "invalid"
  | "notfound"
  | "unknown"
  | "database"
  | "badrequest";
export type ActionPayloadError = {
  type: ErrorType;
  message?: string;
};
export type ActionPayload<T> =
  | { type: "success"; data: T; error: undefined }
  | { type: "error"; data: undefined; error: ActionPayloadError };

export type ActionType<T extends () => Promise<ActionPayload<T>>> = Awaited<
  ReturnType<T>
>["data"];
