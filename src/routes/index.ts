import type { FastifyInstance } from 'fastify';
import { container } from '../container.ts';
import { adminRoutes } from './api/v1/admin.routes.ts';
import { authRoutes } from './api/v1/auth.routes.ts';
import { userRoutes } from './api/v1/user.routes.ts';

export async function registerRoutes(fastify: FastifyInstance) {
  // Get services from container
  const userService = container.resolve('userService');
  const authService = container.resolve('authService');

  fastify.register(
    async (instance) => {
      await authRoutes(instance, authService);
    },
    { prefix: '/api/v1/auth' },
  );

  fastify.register(
    async (instance) => {
      await userRoutes(instance, userService);
    },
    { prefix: '/api/v1/users' },
  );

  fastify.register(
    async (instance) => {
      await adminRoutes(instance, authService);
    },
    { prefix: '/api/v1/admin' },
  );

  fastify.log.info('Routes registered successfully');
}
