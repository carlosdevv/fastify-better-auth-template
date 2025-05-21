import { ErrorDomain } from '../errors/app-error.ts';
import {
  ConflictError,
  InternalServerError,
  NotFoundError,
  ValidationError,
} from '../errors/common-errors.ts';
import type { UpdateUserDTO } from '../models/user.model.ts';
import type { IUserRepository } from '../repositories/interfaces/user-repository.interface.ts';
import type { IUserService } from './interfaces/user-service.interface.ts';

export class UserService implements IUserService {
  private readonly userRepository: IUserRepository;

  constructor({ userRepository }: { userRepository: IUserRepository }) {
    this.userRepository = userRepository;
  }

  async getUsers() {
    try {
      return await this.userRepository.findMany();
    } catch (error) {
      throw new InternalServerError(
        `Error fetching users: ${error instanceof Error ? error.message : String(error)}`,
        ErrorDomain.USER,
      );
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new NotFoundError(`User with ID ${id} not found.`, ErrorDomain.USER, {
          userId: id,
        });
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError(
        `Error fetching user: ${error instanceof Error ? error.message : String(error)}`,
        ErrorDomain.USER,
      );
    }
  }

  async updateUser(id: string, data: UpdateUserDTO) {
    try {
      const userExists = await this.userRepository.findById(id);

      if (!userExists) {
        throw new NotFoundError(`User with ID ${id} not found.`, ErrorDomain.USER, {
          userId: id,
        });
      }

      if (data.email) {
        const emailExists = await this.userRepository.findByEmail(data.email);

        if (emailExists && emailExists.id !== id) {
          throw new ConflictError(`Email ${data.email} already in use.`, ErrorDomain.USER, {
            email: data.email,
          });
        }
      }

      return await this.userRepository.update(id, data);
    } catch (error) {
      if (
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof ValidationError
      ) {
        throw error;
      }

      throw new InternalServerError(
        `Error updating user: ${error instanceof Error ? error.message : String(error)}`,
        ErrorDomain.USER,
      );
    }
  }

  async deleteUser(id: string) {
    try {
      const userExists = await this.userRepository.findById(id);

      if (!userExists) {
        throw new NotFoundError(`User with ID ${id} not found.`, ErrorDomain.USER, {
          userId: id,
        });
      }

      await this.userRepository.delete(id);

      return { success: true, message: 'User deleted successfully.' };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      throw new InternalServerError(
        `Error deleting user: ${error instanceof Error ? error.message : String(error)}`,
        ErrorDomain.USER,
      );
    }
  }
}
