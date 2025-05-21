import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { AuthController } from '../../controllers/auth.controller.ts';

export function setupAdminRoutes(fastify: FastifyInstance, authController: AuthController) {
  fastify.route({
    method: 'POST',
    url: '/revoke-sessions',
    schema: {
      tags: ['admin'],
      summary: 'Revoke all user sessions',
      description: 'Revokes all active sessions',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Sessions revoked successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          description: 'Access denied',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        500: {
          description: 'Internal error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.isAdmin],
    handler: authController.revokeAllSessions.bind(authController),
  });

  fastify.route({
    method: 'POST',
    url: '/revoke-session/:userId',
    schema: {
      tags: ['admin'],
      summary: 'Revoke user session',
      description: 'Revokes a specific user session',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Sessions revoked successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        403: {
          description: 'Access denied',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
        500: {
          description: 'Internal error',
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.isAdmin],
    handler: async (request, reply) => {
      const typedRequest = request as FastifyRequest<{ Params: { userId: string } }>;
      return authController.revokeSession(typedRequest, reply);
    },
  });
}
