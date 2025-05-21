import { fromNodeHeaders } from 'better-auth/node';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import type { Session } from '../../auth.ts';
import { ErrorDomain } from '../../errors/app-error.ts';
import { UnauthorizedError } from '../../errors/common-errors.ts';

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
        throw new UnauthorizedError(
          'You need to be logged in to access this resource.',
          ErrorDomain.AUTH,
          { requestId: request.id },
        );
      }

      request.session = session;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        return reply.errorResponse(error);
      }

      fastify.log.error(error, 'Error verifying authentication');
      return reply.errorResponse(
        new UnauthorizedError('Error verifying authentication.', ErrorDomain.AUTH, {
          requestId: request.id,
          originalError: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  };

  fastify.decorate('authenticate', authenticate);
}

export default fp(sessionPlugin, {
  name: 'session-plugin',
  dependencies: ['auth-plugin', 'error-handler'],
});
