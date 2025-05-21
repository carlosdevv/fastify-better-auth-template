import type { FastifyInstance, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { AppError, ErrorDomain } from '../../errors/app-error.ts';
import { InternalServerError } from '../../errors/common-errors.ts';

interface ErrorHandlerOptions {
  logErrors?: boolean;
  includeErrorDetails?: boolean;
}

async function errorHandlerPlugin(
  fastify: FastifyInstance,
  options: ErrorHandlerOptions = { logErrors: true, includeErrorDetails: false },
) {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      if (options.logErrors) {
        fastify.log.error(
          {
            err: error,
            request: {
              method: request.method,
              url: request.url,
              query: request.query,
              params: request.params,
              headers: request.headers,
              id: request.id,
            },
          },
          `[${error.domain}] Error: ${error.message}`,
        );
      }

      return reply.code(error.statusCode).send(error.toResponse());
    }

    const internalError = new InternalServerError(
      'An unexpected error occurred. Please try again later.',
      ErrorDomain.SYSTEM,
      options.includeErrorDetails
        ? { originalError: error.message, stack: error.stack || '' }
        : undefined,
    );

    fastify.log.error(
      {
        err: error,
        request: {
          method: request.method,
          url: request.url,
          query: request.query,
          params: request.params,
          headers: request.headers,
          id: request.id,
        },
      },
      `[${internalError.domain}] Unhandled error: ${error.message}`,
    );

    return reply.code(internalError.statusCode).send(internalError.toResponse());
  });

  const replyWithError = (reply: FastifyReply, error: AppError) => {
    return reply.code(error.statusCode).send(error.toResponse());
  };

  fastify.decorateReply('errorResponse', function (error: AppError) {
    return replyWithError(this, error);
  });
}

declare module 'fastify' {
  interface FastifyReply {
    errorResponse(error: AppError): FastifyReply;
  }
}

export default fp(errorHandlerPlugin, {
  name: 'error-handler',
});
