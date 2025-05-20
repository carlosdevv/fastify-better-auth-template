import type { User } from '@prisma/client';
import type { UpdateUserDTO } from '../../models/user.model.ts';

export interface IUserService {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<User>;
}
