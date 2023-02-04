import * as jwt from "jsonwebtoken";
type TokenData = {
  id: string;
};
export default function TokenDecode(header: string): string | null {
  const token = header && header.split(" ")[1];

  let payload: TokenData | null = null;
  try {
    payload = jwt.verify(token!, process.env.ACCESS_TOKEN_SECRET!) as TokenData;
  } catch (e) {
    payload = null;
  }

  return payload ? payload.id : null;
}
