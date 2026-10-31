import { z } from 'zod';

const nullableText = z.string().max(500).optional().nullable();

export const createCustomerSchema = z.object({
  name: z.string().trim().min(2, 'Customer name must be at least 2 characters').max(200),
  email: z.string().trim().email('A valid email is required').transform((value) => value.toLowerCase()),
  phone: z.string().trim().max(30).optional().nullable(),
  companyName: z.string().trim().max(200).optional().nullable(),
  gstin: z.string().trim().max(20).optional().nullable(),
  billingAddress: nullableText,
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(20).optional().nullable(),
  userId: z.string().min(1).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial().omit({ userId: true });
