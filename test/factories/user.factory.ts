import type { User } from '@prisma/client';

type UserInput = Partial<User>;

export function createUser(override: UserInput = {}): User {
  const defaultUser: User = {
    id: String(Math.floor(Math.random() * 1000)),
    email: `user-${Math.random().toString(36).substring(2, 7)}@example.com`,
    name: `Test User ${Math.floor(Math.random() * 100)}`,
    emailVerified: false,
    role: 'USER',
    createdAt: new Date(),
    updatedAt: new Date(),
    image: null,
    banned: null,
    banReason: null,
    banExpires: null,
  };

  return { ...defaultUser, ...override };
}

export function createUserList(quantity: number, override: UserInput = {}): User[] {
  return Array.from({ length: quantity }).map(() => createUser(override));
}

export function createAdminUser(override: UserInput = {}): User {
  return createUser({ role: 'ADMIN', ...override });
}
