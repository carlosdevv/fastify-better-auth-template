import { beforeEach, describe, expect, it } from 'vitest';
import { NotFoundError } from '../../../src/errors/common-errors.ts';
import { UserService } from '../../../src/services/user.service.ts';
import { createUser, createUserList } from '../../factories/user.factory.ts';
import { InMemoryUserRepository } from '../../mocks/repositories/in-memory-user.repository.ts';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: InMemoryUserRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    userService = new UserService({ userRepository });
  });

  describe('getUsers', () => {
    it('should return the list of users', async () => {
      const mockUsers = createUserList(2);
      mockUsers.forEach((user) => userRepository.addUser(user));

      const result = await userService.getUsers();

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining(mockUsers));
    });

    it('should return an empty list when there are no users', async () => {
      const result = await userService.getUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getUserById', () => {
    it('should return a user when the ID exists', async () => {
      const mockUser = createUser({ id: '123' });
      userRepository.addUser(mockUser);

      const result = await userService.getUserById('123');

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundError when the ID does not exist', async () => {
      await expect(userService.getUserById('999')).rejects.toThrow(NotFoundError);
      await expect(userService.getUserById('999')).rejects.toThrow('User with ID 999 not found');
    });
  });

  describe('updateUser', () => {
    it('should update a user when the ID exists', async () => {
      const userId = '123';
      const mockUser = createUser({ id: userId, name: 'Nome Original' });
      userRepository.addUser(mockUser);

      const updateData = { name: 'Nome Atualizado' };

      const result = await userService.updateUser(userId, updateData);

      expect(result.name).toBe('Nome Atualizado');
      expect(result.id).toBe(userId);

      const updatedUser = await userRepository.findById(userId);
      expect(updatedUser?.name).toBe('Nome Atualizado');
    });

    it('should throw NotFoundError when trying to update a non-existent user', async () => {
      await expect(userService.updateUser('999', { name: 'Test' })).rejects.toThrow(NotFoundError);
    });

    it('should verify if the email is already in use when updating', async () => {
      const user1 = createUser({ id: '111', email: 'user1@example.com' });
      const user2 = createUser({ id: '222', email: 'user2@example.com' });

      userRepository.addUser(user1);
      userRepository.addUser(user2);

      const updateData = { email: 'user2@example.com' };

      await expect(userService.updateUser('111', updateData)).rejects.toThrow(
        'Email user2@example.com already in use',
      );
    });

    it('should allow updating to the same email', async () => {
      const user = createUser({ id: '111', email: 'same@example.com' });
      userRepository.addUser(user);

      const result = await userService.updateUser('111', {
        email: 'same@example.com',
        name: 'Novo Nome',
      });

      expect(result.email).toBe('same@example.com');
      expect(result.name).toBe('Novo Nome');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user when the ID exists', async () => {
      const userId = '123';
      const mockUser = createUser({ id: userId });
      userRepository.addUser(mockUser);

      const result = await userService.deleteUser(userId);

      expect(result).toEqual({ success: true, message: 'User deleted successfully.' });

      const deletedUser = await userRepository.findById(userId);
      expect(deletedUser).toBeNull();
    });

    it('should throw NotFoundError when trying to delete a non-existent user', async () => {
      await expect(userService.deleteUser('999')).rejects.toThrow(NotFoundError);
    });
  });
});
