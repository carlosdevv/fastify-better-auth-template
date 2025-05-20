import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.config.ts';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
});

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default { prisma };
