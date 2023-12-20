import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, errors } from "jose";
import { TokenData } from "./app/lib/JWTUtils";
import { redirect } from "next/navigation";

let ignoredPaths = ["/api/auth/refresh", "/favicon.ico"];

export async function middleware(req: NextRequest) {
  let requestHeaders = new Headers(req.headers);
  try {
    let authCookie = req.cookies.get("access_token")?.value;
    let authHeader = req.headers.get("authorization")?.split(" ")[1];
    let token = authCookie ?? authHeader;
    if (!token) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    let result = (await jwtVerify(
      token,
      Buffer.from(process.env.ACCESS_TOKEN_SECRET!),
    )) as TokenData;

    requestHeaders.set("user_id", result.payload.id!);
  } catch (e) {
    if (e instanceof errors.JWTExpired) {
      console.log("setting expired header on route", req.nextUrl.pathname);
      requestHeaders.set("auth-expired", String(1));
    } else if (e instanceof errors.JWTInvalid) {
      requestHeaders.delete("access_token");

      // TODO: add from search param to get back after login
      redirect("/login");
    } else {
      console.log("unknown middleware error: ", e);
    }
  }
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: "/((?!api/auth/refresh|_next|favicon.ico).*)",
};
