import type { FastifyInstance, FastifyRequest } from 'fastify';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { UserController } from '../../../controllers/user.controller.ts';
import { type UpdateUserDTO, updateUserSchema } from '../../../models/user.model.ts';
import type { IUserService } from '../../../services/interfaces/user-service.interface.ts';

export async function userRoutes(fastify: FastifyInstance, userService: IUserService) {
  const userController = new UserController(userService);

  const updateUserJsonSchema = zodToJsonSchema(updateUserSchema, { $refStrategy: 'none' });

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['users'],
      summary: 'List all users',
      description: 'List all users in the system',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          description: 'List of users',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              email: { type: 'string' },
              name: { type: 'string' },
              role: { type: 'string' },
              emailVerified: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    preHandler: [fastify.authenticate, fastify.isAdmin],
    handler: userController.getUsers.bind(userController),
  });

  fastify.route({
    method: 'GET',
    url: '/:id',
    schema: {
      tags: ['users'],
      summary: 'Get user by ID',
      description: 'Get a specific user by ID',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'User details',
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const typedRequest = request as FastifyRequest<{ Params: { id: string } }>;
      return userController.getUserById(typedRequest, reply);
    },
  });

  fastify.route({
    method: 'PUT',
    url: '/:id',
    schema: {
      tags: ['users'],
      summary: 'Update user',
      description: 'Update an existing user',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: updateUserJsonSchema,
      response: {
        200: {
          description: 'User updated successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            emailVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        403: {
          description: 'Forbidden',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const typedRequest = request as FastifyRequest<{
        Params: { id: string };
        Body: UpdateUserDTO;
      }>;
      return userController.updateUser(typedRequest, reply);
    },
  });

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    schema: {
      tags: ['users'],
      summary: 'Delete user',
      description: 'Delete a user',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        200: {
          description: 'User deleted',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
          },
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      const typedRequest = request as FastifyRequest<{ Params: { id: string } }>;
      return userController.deleteUser(typedRequest, reply);
    },
  });
}
