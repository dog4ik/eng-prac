import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { Context } from "./context";
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({ transformer: superjson });

const isLogged = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
  return next({ ctx: { userId: ctx.user } });
});
// Base router and procedure helpers
export const router = t.router;
export const procedure = t.procedure;
export const protectedProcedure = t.procedure.use(isLogged);
