import type { FastifyReply, FastifyRequest } from 'fastify';
import type { UpdateUserDTO } from '../../models/user.model.ts';

export interface IUserController {
  getUsers(request: FastifyRequest, reply: FastifyReply): Promise<never>;
  getUserById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<never>;
  updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDTO }>,
    reply: FastifyReply,
  ): Promise<never>;
  deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ): Promise<never>;
}
