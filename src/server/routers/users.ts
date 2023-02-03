import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../../prisma/PrismaClient";
import { router, procedure, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  create: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(40),
      })
    )
    .mutation(async ({ input }) => {
      const passwordHash = await bcrypt.hash(input.password, 10);
      const user = await prisma.user
        .create({
          data: {
            email: input.email,
            password: passwordHash,
          },
        })
        .catch(() => {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        });
      const access_token = jwt.sign(
        { id: user!.id },
        process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "20s" }
      );
      const refresh_token = jwt.sign(
        { id: user!.id },
        process.env.REFRESH_TOKEN_SECRET!
      );
      return { refresh_token, access_token };
    }),

  credentials: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user
      .findUnique({
        where: { id: ctx.userId },
        select: {
          email: true,
          name: true,
          id: true,
          notifications: true,
          role: true,
        },
      })
      .catch(() => {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      });
    if (user === null) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),

  login: procedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8).max(40),
      })
    )
    .mutation(
      async ({
        input,
      }): Promise<{ access_token: string; refresh_token: string }> => {
        const user = await prisma.user.findUnique({
          where: { email: input.email },
        });
        if (user === null) throw new TRPCError({ code: "NOT_FOUND" });
        if (
          await bcrypt.compare(input.password, user.password).catch(() => false)
        ) {
          const access_token = jwt.sign(
            { id: user.id },
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: "20s" }
          );
          const refresh_token = jwt.sign(
            { id: user!.id },
            process.env.REFRESH_TOKEN_SECRET!
          );
          return { access_token: access_token, refresh_token: refresh_token };
        } else {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
      }
    ),
});
