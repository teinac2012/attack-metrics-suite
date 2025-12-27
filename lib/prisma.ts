import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as any;

export const getPrisma = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  return globalForPrisma.prisma;
};

export const prisma = (() => {
  try {
    return getPrisma();
  } catch {
    // Return a dummy object during build; will be replaced at runtime
    return null;
  }
})() as any;