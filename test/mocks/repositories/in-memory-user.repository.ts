import type { User } from '@prisma/client';
import type { IUserRepository } from '../../../src/repositories/interfaces/user-repository.interface.ts';

export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor(initialUsers: User[] = []) {
    this.users = [...initialUsers];
  }

  addUser(user: User): void {
    this.users.push(user);
  }

  clear(): void {
    this.users = [];
  }

  async findById(id: string): Promise<User | null> {
    const user = this.users.find((u) => u.id === id);
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    return user || null;
  }

  async findMany(): Promise<User[]> {
    return [...this.users];
  }

  async create(data: { email: string; name?: string }): Promise<User> {
    const newUser: User = {
      id: String(Math.floor(Math.random() * 10000)),
      email: data.email,
      name: data.name || '',
      emailVerified: false,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
      banned: null,
      banReason: null,
      banExpires: null,
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const updatedUser = {
      ...this.users[userIndex],
      ...data,
      updatedAt: new Date(),
    };

    this.users[userIndex] = updatedUser;
    return updatedUser;
  }

  async delete(id: string): Promise<User> {
    const userIndex = this.users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);

    return deletedUser;
  }
}
