import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function adminPlugin(fastify: FastifyInstance) {
  const isAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.session?.user) {
        return reply.unauthorized('You must be logged in to access this resource.');
      }

      if (request.session.user.role !== 'ADMIN') {
        return reply.forbidden('You do not have permission to access this resource.');
      }
    } catch (error) {
      fastify.log.error(error, 'Error verifying admin permissions');
      return reply.forbidden('Error verifying permissions.');
    }
  };

  fastify.decorate('isAdmin', isAdmin);
}

export default fp(adminPlugin, {
  name: 'admin-plugin',
  dependencies: ['session-plugin'],
});
