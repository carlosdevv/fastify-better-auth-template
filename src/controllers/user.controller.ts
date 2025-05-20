import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { type UpdateUserDTO, updateUserSchema } from '../models/user.model.ts';
import type { IUserService } from '../services/interfaces/user-service.interface.ts';
import type { IUserController } from './interfaces/user-controller.interface.ts';

export class UserController implements IUserController {
  constructor(private readonly userService: IUserService) {}

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.findAll();

      return reply.status(200).send(users);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error fetching users',
      });
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const user = await this.userService.findById(id);

      if (!user) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      return reply.status(200).send(user);
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Erro ao buscar usuário',
      });
    }
  }

  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;
      const userData = updateUserSchema.parse(request.body);

      const existingUser = await this.userService.findById(id);

      if (!existingUser) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.userService.findByEmail(userData.email);

        if (userWithEmail && userWithEmail.id !== id) {
          return reply.status(409).send({
            statusCode: 409,
            error: 'Conflict',
            message: 'Email already in use',
          });
        }
      }

      const updatedUser = await this.userService.update(id, userData);

      return reply.status(200).send(updatedUser);
    } catch (error) {
      request.log.error(error);

      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Invalid input data',
          validation: error.errors,
        });
      }

      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error updating user',
      });
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;

      const existingUser = await this.userService.findById(id);

      if (!existingUser) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
        });
      }

      await this.userService.delete(id);

      return reply.status(204).send();
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'Error deleting user',
      });
    }
  }
}
