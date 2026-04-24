import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

function createClient() {
  const dbPath = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.replace("file:", "")
    : path.join(process.cwd(), "prisma", "dev.db");

  const adapter = new PrismaBetterSqlite3({ url: dbPath });
  return new PrismaClient({ adapter, log: ["error"] });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
