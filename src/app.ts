import path from 'node:path';
import { fileURLToPath } from 'node:url';

import AutoLoad from '@fastify/autoload';
import Fastify, { type FastifyServerOptions } from 'fastify';
import { registerRoutes } from './routes/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function buildApp(options?: FastifyServerOptions) {
  const server = Fastify(options);

  // Auto-load plugins
  await server
    .register(AutoLoad, {
      dir: path.join(__dirname, 'plugins'),
      dirNameRoutePrefix: false,
    })
    .then(() => {
      server.log.info('Plugins registered successfully');
    });

  await server.register(registerRoutes);

  server.setNotFoundHandler(
    {
      preHandler: server.rateLimit({
        max: 4,
        timeWindow: 500,
      }),
    },
    (request, reply) => {
      request.log.warn(
        {
          request: {
            method: request.method,
            url: request.url,
            query: request.query,
            params: request.params,
          },
        },
        'Resource not found',
      );

      reply.code(404);

      return {
        error: {
          code: 'SYSTEM-NOT_FOUND-404',
          type: 'NOT_FOUND',
          domain: 'SYSTEM',
          message: 'Resource not found',
          timestamp: new Date().toISOString(),
        },
      };
    },
  );

  return server;
}
