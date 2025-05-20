import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z
    .string()
    .min(6, { message: 'The password must be at least 6 characters long' })
    .max(100),
  name: z.string().min(2, { message: 'The name must be at least 2 characters long' }),
});

export const updateUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }).optional(),
  name: z.string().min(2, { message: 'The name must be at least 2 characters long' }).optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['ADMIN', 'USER']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
