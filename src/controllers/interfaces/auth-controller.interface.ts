import type { FastifyReply, FastifyRequest } from 'fastify';

export interface IAuthController {
  signIn(request: FastifyRequest, reply: FastifyReply): Promise<never>;
  signUp(request: FastifyRequest, reply: FastifyReply): Promise<never>;
  signOut(request: FastifyRequest, reply: FastifyReply): Promise<never>;
  revokeSession(
    request: FastifyRequest<{ Params: { userId: string } }>,
    reply: FastifyReply,
  ): Promise<never>;
  revokeAllSessions(request: FastifyRequest, reply: FastifyReply): Promise<never>;
}
