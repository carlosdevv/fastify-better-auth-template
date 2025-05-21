import { beforeEach, describe, expect, it } from 'vitest';
import { createUser, createUserList } from '../../factories/user.factory.ts';
import { InMemoryUserRepository } from '../../mocks/repositories/in-memory-user.repository.ts';

describe('InMemoryUserRepository', () => {
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
  });

  describe('findById', () => {
    it('should return a user by ID when it exists', async () => {
      const mockUser = createUser({ id: '123' });
      userRepository.addUser(mockUser);

      const result = await userRepository.findById('123');

      expect(result).toEqual(mockUser);
    });

    it('should return null when the user does not exist', async () => {
      const result = await userRepository.findById('999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email when it exists', async () => {
      const mockUser = createUser({ email: 'test@example.com' });
      userRepository.addUser(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
    });

    it('should return null when the email does not exist', async () => {
      const result = await userRepository.findByEmail('non-existent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findMany', () => {
    it('should return a list of users', async () => {
      const mockUsers = createUserList(3);
      mockUsers.forEach((user) => userRepository.addUser(user));

      const result = await userRepository.findMany();

      expect(result).toHaveLength(3);
      expect(result).toEqual(expect.arrayContaining(mockUsers));
    });

    it('should return an empty list when there are no users', async () => {
      const result = await userRepository.findMany();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User',
      };

      const result = await userRepository.create(userData);

      expect(result.email).toBe(userData.email);
      expect(result.name).toBe(userData.name);

      const storedUser = await userRepository.findByEmail(userData.email);
      expect(storedUser).not.toBeNull();
      expect(storedUser?.email).toBe(userData.email);
    });
  });

  describe('update', () => {
    it('should update an existing user', async () => {
      const userId = '123';
      const mockUser = createUser({ id: userId, name: 'Original Name' });
      userRepository.addUser(mockUser);

      const updateData = { name: 'Updated Name' };

      const result = await userRepository.update(userId, updateData);

      expect(result.id).toBe(userId);
      expect(result.name).toBe('Updated Name');

      const updatedUser = await userRepository.findById(userId);
      expect(updatedUser?.name).toBe('Updated Name');
    });

    it('should throw an error when updating a non-existent user', async () => {
      const userId = '999';
      const updateData = { name: 'New Name' };

      await expect(userRepository.update(userId, updateData)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
    });
  });

  describe('delete', () => {
    it('should delete an existing user', async () => {
      const userId = '123';
      const mockUser = createUser({ id: userId });
      userRepository.addUser(mockUser);

      const result = await userRepository.delete(userId);

      expect(result).toEqual(mockUser);

      const deletedUser = await userRepository.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should throw an error when deleting a non-existent user', async () => {
      const userId = '999';

      await expect(userRepository.delete(userId)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
    });
  });
});
