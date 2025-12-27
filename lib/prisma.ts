import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as any;

export const prisma = (() => {
  if (!globalForPrisma.prisma) {
    try {
      const connectionString = process.env.DATABASE_URL;
      if (!connectionString) {
        throw new Error("DATABASE_URL environment variable is not set");
      }

      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool);

      globalForPrisma.prisma = new PrismaClient({
        adapter,
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