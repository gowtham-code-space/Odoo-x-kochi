import { z } from 'zod';

export const createTaxSchema = z.object({
  name: z.string().trim().min(2).max(100),
  rate: z.number().min(0).max(100),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateTaxSchema = createTaxSchema.partial();
