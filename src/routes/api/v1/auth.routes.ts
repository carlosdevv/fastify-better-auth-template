import type { FastifyInstance } from 'fastify';
import { AuthController } from '../../../controllers/auth.controller.ts';
import type { IAuthService } from '../../../services/interfaces/auth-service.interface.ts';

export async function authRoutes(fastify: FastifyInstance, authService: IAuthService) {
  const authController = new AuthController(authService);

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
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            expiresIn: { type: 'number' },
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
