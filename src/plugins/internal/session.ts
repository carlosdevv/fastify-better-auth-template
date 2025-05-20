import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Session } from '../../auth.ts';

declare module 'fastify' {
  interface FastifyRequest {
    session: Session;
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function sessionPlugin(fastify: FastifyInstance) {
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (request.session?.user) {
        return;
      }

      const session = await fastify.auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });

      if (!session?.user) {
        return reply.unauthorized('You must be logged in to access this resource.');
      }

      request.session = session;
    } catch (error) {
      fastify.log.error(error, 'Error verifying authentication');
      return reply.unauthorized('Error verifying authentication.');
    }
  };

  fastify.decorate('authenticate', authenticate);
}

export default fp(sessionPlugin, {
  name: 'session-plugin',
  dependencies: ['auth-plugin'],
});
