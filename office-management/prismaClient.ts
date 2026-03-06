import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// create an adapter instance using DATABASE_URL
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const client = global.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") global.prisma = client;

export const prisma = client;
export default prisma;