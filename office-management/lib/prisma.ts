// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create the connection pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10 // Recommended for Neon serverless
});

const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter, // Prisma 7 mandatory strategy
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;