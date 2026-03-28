// prisma.config.ts
import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';
import path from 'path';

// Force load the .env file from the root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // This ensures the URL is strictly a string and not undefined
    url: process.env.DATABASE_URL as string,
  },
});