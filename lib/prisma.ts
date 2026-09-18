import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 needs a driver adapter to talk to Postgres.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// Next.js reloads modules while you edit, which would otherwise open a new
// database connection every time. Keeping one on globalThis avoids that.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
