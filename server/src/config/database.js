import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

if (env.isDev) {
  globalForPrisma.prisma = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err.message);
    throw err;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

