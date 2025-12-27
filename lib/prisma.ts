import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

export const prisma = (() => {
  if (!globalForPrisma.prisma) {
    try {
      globalForPrisma.prisma = new PrismaClient({
        log: ['error', 'warn'],
      });
    } catch (error) {
      console.error("Failed to initialize Prisma:", error);
      throw error;
    }
  }
  return globalForPrisma.prisma;
})() as PrismaClient;

export default prisma;