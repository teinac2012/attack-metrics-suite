import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as any;

let prisma: PrismaClient;

if (!globalForPrisma.prisma) {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } else {
    // Fallback without adapter for build time
    prisma = new PrismaClient({ adapter: null as any });
  }
  
  globalForPrisma.prisma = prisma;
} else {
  prisma = globalForPrisma.prisma;
}

export { prisma };