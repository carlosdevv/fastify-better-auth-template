import type { FastifyInstance } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { AuthController } from '../../controllers/auth.controller.ts';
import { loginResponseSchema } from '../../models/auth.model.ts';

export function setupAuthRoutes(fastify: FastifyInstance, authController: AuthController) {
  const loginResponseJsonSchema = zodToJsonSchema(loginResponseSchema, { $refStrategy: 'none' });

  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      tags: ['auth'],
      summary: 'Login',
      description: 'Authenticate user with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      response: {
        200: loginResponseJsonSchema,
        401: {
          description: 'Login failed',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: authController.signIn.bind(authController),
  });

  fastify.route({
    method: 'POST',
    url: '/signup',
    schema: {
      tags: ['auth'],
      summary: 'Create account',
      description: 'Register a new user account',
      body: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          name: { type: 'string', minLength: 2 },
        },
      },
      response: {
        201: {
          description: 'Account created successfully',
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                emailVerified: { type: 'boolean' },
              },
            },
          },
        },
        400: {
          description: 'Registration failed',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    handler: authController.signUp.bind(authController),
  });

  fastify.route({
    method: 'POST',
    url: '/logout',
    schema: {
      tags: ['auth'],
      summary: 'Logout',
      description: 'Revoke access token',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: authController.signOut.bind(authController),
  });
}
