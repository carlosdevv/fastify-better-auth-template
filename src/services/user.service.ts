import { prisma } from '../db/index.ts';
import type { UpdateUserDTO } from '../models/user.model.ts';
import type { IUserService } from './interfaces/user-service.interface.ts';

export class UserService implements IUserService {
  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email },
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async findAll() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      console.error('Error finding all users:', error);
      return [];
    }
  }

  async update(id: string, data: UpdateUserDTO) {
    try {
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      return await prisma.user.update({
        where: { id },
        data: data,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      const existingUser = await this.findById(id);
      if (!existingUser) {
        throw new Error('User not found');
      }

      await prisma.user.delete({
        where: { id },
      });

      return existingUser;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}
