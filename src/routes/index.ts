import type { FastifyInstance } from 'fastify';
import { container } from '../container.ts';
import { setupAdminRoutes } from './api/admin.routes.ts';
import { setupAuthRoutes } from './api/auth.routes.ts';
import { setupUserRoutes } from './api/user.routes.ts';

export async function registerRoutes(fastify: FastifyInstance) {
  const userController = container.resolve('userController');
  const authController = container.resolve('authController');

  fastify.register(
    async (instance) => {
      setupAuthRoutes(instance, authController);
    },
    { prefix: '/api/auth' },
  );

  fastify.register(
    async (instance) => {
      setupUserRoutes(instance, userController);
    },
    { prefix: '/api/users' },
  );

  fastify.register(
    async (instance) => {
      setupAdminRoutes(instance, authController);
    },
    { prefix: '/api/admin' },
  );

  fastify.log.info('Routes registered successfully');
}
