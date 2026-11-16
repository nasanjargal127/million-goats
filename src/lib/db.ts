import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Reuse one client per process (and across dev hot reloads).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function getClient() {
  if (!globalForPrisma.prisma) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL is not set");
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
  }
  return globalForPrisma.prisma;
}

/**
 * Lazily-connected Prisma client. The real client is created on first use, so
 * importing this module (e.g. while `next build` collects route config) does not
 * require DATABASE_URL — only running a query does.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
