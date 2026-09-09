import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrisma() {
  const url = process.env.DATABASE_URL ?? "postgresql://x:x@localhost:5432/x";
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["error"] : [] });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
