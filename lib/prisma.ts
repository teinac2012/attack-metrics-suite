import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  prisma = new PrismaClient();
  globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export { prisma };