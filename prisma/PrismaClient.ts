import { PrismaClient as client } from "@prisma/client";
const PrismaClient = new client();
PrismaClient.$disconnect();
export default PrismaClient;
