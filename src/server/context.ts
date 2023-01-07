import { inferAsyncReturnType } from "@trpc/server";
import { CreateNextContextOptions } from "@trpc/server/adapters/next";
import TokenDecode from "../utils/Tokendecode";
export async function createContext({ req, res }: CreateNextContextOptions) {
  // Create your context based on the request object
  // Will be available as `ctx` in all your resolvers
  async function getUserFromHeader() {
    if (req.headers.authorization) {
      const user = TokenDecode(req.headers.authorization);
      return user;
    }
    return null;
  }
  const user = await getUserFromHeader();
  return {
    user,
  };
}
export type Context = inferAsyncReturnType<typeof createContext>;
