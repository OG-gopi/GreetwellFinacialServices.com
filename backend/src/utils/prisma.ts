import { PrismaClient } from '@prisma/client';

if (!process.env.DATABASE_URL) {
  console.warn('⚠️ [PRISMA WARNING] DATABASE_URL environment variable is missing or empty. Please set DATABASE_URL in Vercel environment settings.');
}
if (!process.env.DIRECT_URL) {
  console.warn('⚠️ [PRISMA WARNING] DIRECT_URL environment variable is missing or empty. Please set DIRECT_URL in Vercel environment settings.');
}

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});
