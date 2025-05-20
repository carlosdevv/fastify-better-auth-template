import Swagger from '@fastify/swagger';
import ScalarApiReference from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import packageJson from '../../../package.json' with { type: 'json' };
import { env } from '../../config/env.config.ts';

async function swaggerPlugin(fastify: FastifyInstance) {
  await fastify.register(Swagger, {
    openapi: {
      openapi: '3.1.1',
      info: {
        title: 'Borderless API',
        description: 'API Documentation for Borderless',
        version: packageJson.version,
      },
      servers: [
        {
          url: `http://${env.HOST || 'localhost'}:${env.PORT || 3333}`,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      tags: [
        { name: 'auth', description: 'Authentication endpoints' },
        { name: 'users', description: 'User related endpoints' },
        { name: 'admin', description: 'Administration endpoints' },
      ],
    },
  });

  await fastify.register(ScalarApiReference, {
    routePrefix: '/api/docs',
  });

  fastify.log.info('API Reference is available at /api/docs');
}

export default fp(swaggerPlugin, {
  name: 'swagger-plugin',
});
