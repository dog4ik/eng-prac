"use server";
import { revalidatePath } from "next/cache";
import prisma from "../../../../../prisma/PrismaClient";
import { tryGetUserId } from "../../getUserId";
import { DatabaseError, NotFoundError } from "../errors";

export async function fetchUser() {
  revalidatePath("/");
  let userId = tryGetUserId();
  let user = await prisma.user
    .findUnique({
      where: { id: userId },
      select: {
        email: true,
        name: true,
        id: true,
        role: true,
      },
    })
    .catch(() => {
      throw new DatabaseError();
    });
  if (!user) throw new NotFoundError("User not found");
  return user;
}
