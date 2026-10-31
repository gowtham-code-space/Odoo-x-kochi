import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(9, 'Password must be more than 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase()),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(32).max(200),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});

