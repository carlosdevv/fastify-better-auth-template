import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { ErrorDomain } from '../../errors/app-error.ts';
import { ForbiddenError, UnauthorizedError } from '../../errors/common-errors.ts';

declare module 'fastify' {
  interface FastifyInstance {
    isAdmin: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function adminPlugin(fastify: FastifyInstance) {
  const isAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!request.session?.user) {
        throw new UnauthorizedError(
          'You need to be logged in to access this resource.',
          ErrorDomain.AUTH,
          { requestId: request.id },
        );
      }

      if (request.session.user.role !== 'ADMIN') {
        throw new ForbiddenError(
          'You do not have permission to access this resource.',
          ErrorDomain.ADMIN,
          {
            requestId: request.id,
            userRole: request.session.user.role || 'Unknown',
            requiredRole: 'ADMIN',
          },
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
        return reply.errorResponse(error);
      }

      fastify.log.error(error, 'Error verifying admin permissions');
      return reply.errorResponse(
        new ForbiddenError('Error verifying permissions.', ErrorDomain.ADMIN, {
          requestId: request.id,
          originalError: error instanceof Error ? error.message : String(error),
        }),
      );
    }
  };

  fastify.decorate('isAdmin', isAdmin);
}

export default fp(adminPlugin, {
  name: 'admin-plugin',
  dependencies: ['session-plugin', 'error-handler'],
});
