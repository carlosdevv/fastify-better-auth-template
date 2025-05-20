import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { prisma } from '../../db/index.ts';

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof prisma;
  }
}

async function dbPlugin(fastify: FastifyInstance) {
  fastify.decorate('db', prisma);
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
}

export default fp(dbPlugin, {
  name: 'db-plugin',
});
