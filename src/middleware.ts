import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, errors } from "jose";
import { TokenData } from "./app/lib/JWTUtils";
import { redirect } from "next/navigation";

export async function middleware(req: NextRequest) {
  let requestHeaders = new Headers(req.headers);
  try {
    let authCookie = req.cookies.get("access_token");
    let authHeader = req.headers.get("authorization");
    if (!authCookie && !authHeader) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }

    let token = authCookie ? authCookie.value : authHeader!.split(" ")[1];

    let result = (await jwtVerify(
      token,
      Buffer.from(process.env.ACCESS_TOKEN_SECRET!),
    )) as TokenData;
    requestHeaders.set("user_id", result.payload.id!);
  } catch (e) {
    if (e instanceof errors.JWTExpired) {
      console.log("setting expired header");
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
  matcher: ["/:path*", "/!login"],
};
