import { NextRequest } from "next/server";
import { TokenData, signAccessToken } from "../../../lib/JWTUtils";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import sleep from "../../../lib/utils/sleep";

export async function POST(req: NextRequest) {
  await sleep(1000);
  let cookieList = cookies();
  let headers = { "Cache-control": "no-store" };
  try {
    let body: { refresh_token: string } = await req.json();
    let result: TokenData = await jwtVerify(
      body.refresh_token,
      Buffer.from(process.env.REFRESH_TOKEN_SECRET!),
    );
    let access_token = await signAccessToken(result.payload.id);
    cookieList.set("access_token", access_token);
    console.log("updated token", access_token);
    return new Response(JSON.stringify({ access_token }), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.log("failed to refresh token", error);
    cookieList.delete("access_token");
    return new Response(undefined, { status: 400, headers });
  }
}
