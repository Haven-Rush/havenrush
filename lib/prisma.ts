import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma Client. In dev, Next.js hot-reloads modules on every
 * edit, which would otherwise create a new PrismaClient (and a new
 * connection pool) per reload — stash it on `globalThis` to reuse one.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
