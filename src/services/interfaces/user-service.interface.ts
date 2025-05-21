import type { User } from '@prisma/client';
import type { UpdateUserDTO } from '../../models/user.model.ts';

export interface IUserService {
  getUsers(): Promise<User[]>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: UpdateUserDTO): Promise<User>;
  deleteUser(id: string): Promise<{ success: boolean; message: string }>;
}
