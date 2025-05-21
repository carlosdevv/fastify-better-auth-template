import { z } from 'zod';
import type { createUserSchema } from './user.model.ts';

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string().optional(),
  emailVerified: z.boolean(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const loginResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    user: sessionUserSchema,
    token: z.object({
      accessToken: z.string(),
      expiresIn: z.number(),
    }),
  }),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type SignUpDTO = z.infer<typeof createUserSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
