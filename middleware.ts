// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";
const isUserRoute = (pathname: string) => {
  return pathname.startsWith("/api/users");
};
export function middleware(req: NextRequest) {
  let user_id: string;
  const response = NextResponse.next();
  const token =
    req.headers.get("authorization") &&
    req.headers.get("authorization")!.split(" ")[1];

  jwt.verify(
    token!,
    process.env.ACCESS_TOKEN_SECRET!,
    async (err: any, token_data: any) => {
      if (err) {
        if (err.message == "jwt malformed") {
          return NextResponse.redirect(new URL("/api/error", req.url));
        }
        console.log(err.message);
        return;
      } else {
        user_id = token_data.id;
        response.cookies.set("id", user_id);
      }
    }
  );
  return NextResponse.next();
}

export const config = {
  matcher: "/api/translations/getsda",
};
