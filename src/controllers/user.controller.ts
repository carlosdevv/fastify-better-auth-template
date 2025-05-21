import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError, ErrorDomain } from '../errors/app-error.ts';
import { InternalServerError, ValidationError } from '../errors/common-errors.ts';
import { type UpdateUserDTO, updateUserSchema } from '../models/user.model.ts';
import type { IUserService } from '../services/interfaces/user-service.interface.ts';
import type { IUserController } from './interfaces/user-controller.interface.ts';

export class UserController implements IUserController {
  private readonly userService: IUserService;

  constructor({ userService }: { userService: IUserService }) {
    this.userService = userService;
  }

  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getUsers();
      return reply.status(200).send(users);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.errorResponse(error);
      }
      request.log.error(error);
      return reply.errorResponse(new InternalServerError('Error fetching users', ErrorDomain.USER));
    }
  }

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const user = await this.userService.getUserById(id);
      return reply.status(200).send(user);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.errorResponse(error);
      }
      request.log.error(error);
      return reply.errorResponse(new InternalServerError('Error fetching user', ErrorDomain.USER));
    }
  }

  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserDTO }>,
    reply: FastifyReply,
  ) {
    try {
      const { id } = request.params;

      try {
        updateUserSchema.parse(request.body);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          throw new ValidationError('Invalid input data.', ErrorDomain.USER, {
            validationErrors: zodError.errors.map((err) => ({
              path: err.path.join('.'),
              message: err.message,
            })),
          });
        }
        throw zodError;
      }

      const updatedUser = await this.userService.updateUser(id, request.body);
      return reply.status(200).send(updatedUser);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.errorResponse(error);
      }
      request.log.error(error);
      return reply.errorResponse(new InternalServerError('Error updating user', ErrorDomain.USER));
    }
  }

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    try {
      const { id } = request.params;
      const result = await this.userService.deleteUser(id);
      return reply.status(200).send(result);
    } catch (error) {
      if (error instanceof AppError) {
        return reply.errorResponse(error);
      }
      request.log.error(error);
      return reply.errorResponse(new InternalServerError('Error deleting user', ErrorDomain.USER));
    }
  }
}
