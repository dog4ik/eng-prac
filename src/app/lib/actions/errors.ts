import { ActionPayload, ErrorType } from "./ActionPayload";
export class BaseError {
  type: ErrorType;
  message: string | undefined;
  constructor(type: ErrorType, message?: string) {
    this.type = type;
    this.message = message;
  }
}

export class NotFoundError extends BaseError {
  constructor(message?: string) {
    super("notfound", message);
  }
}

export class BadRequestError extends BaseError {
  constructor(message?: string) {
    super("badrequest", message);
  }
}

export class TokenExpiredError extends BaseError {
  constructor(message?: string) {
    super("expired", message);
  }
}

export class TokenInvalidError extends BaseError {
  constructor(message?: string) {
    super("invalid", message);
  }
}

export class DatabaseError extends BaseError {
  constructor(message?: string) {
    super("database", message);
  }
}

export class UnknownError extends BaseError {
  constructor(message?: string) {
    super("unknown", message);
  }
}

export function errorFromActionPayload<T>(
  payload: ActionPayload<T>["error"] extends undefined
    ? never
    : ActionPayload<T>["error"],
) {
  if (payload == undefined) throw new UnknownError("This should never happen");
  return new BaseError(payload.type, payload.message);
}
