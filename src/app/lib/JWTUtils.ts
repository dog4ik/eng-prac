import { JWTVerifyResult, SignJWT } from "jose";

export interface TokenData extends JWTVerifyResult {
  payload: { id: string };
}

function createJWT(userId: string, expireTimeInMinutes?: number) {
  const now = Math.floor(Date.now() / 1000);
  let token = new SignJWT({ id: userId })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuedAt(now);
  if (expireTimeInMinutes !== undefined) {
    token.setExpirationTime(now + expireTimeInMinutes * 60);
  }
  return token;
}

export async function signAccessToken(userId: string) {
  let token = createJWT(userId, 0.1);
  return await token.sign(Buffer.from(process.env.ACCESS_TOKEN_SECRET!));
}

export async function signRefreshToken(userId: string) {
  let token = createJWT(userId);
  return await token.sign(Buffer.from(process.env.REFRESH_TOKEN_SECRET!));
}
