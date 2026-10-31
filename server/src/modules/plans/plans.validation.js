import { z } from 'zod';

export const createPlanSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(200),
  description: z.string().max(2000).optional(),
  billingFrequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL']),
  basePrice: z.number().positive('Base price must be positive'),
  setupFee: z.number().min(0).optional().nullable(),
  trialDays: z.number().int().min(0).default(0),
  minQuantity: z.number().int().min(1).default(1),
  isActive: z.boolean().optional().default(true),
  availableFrom: z.string().datetime().optional().nullable(),
  availableUntil: z.string().datetime().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional().default('DRAFT'),
  autoCloseAtEnd: z.boolean().optional(),
  allowEarlyClose: z.boolean().optional(),
  allowPause: z.boolean().optional(),
  allowRenewal: z.boolean().optional(),
  paymentTermsDays: z.number().int().min(0).max(365).optional(),
  features: z.record(z.unknown()).optional().nullable(),
});

export const updatePlanSchema = createPlanSchema.partial().omit({ productId: true });

export const archivePlanSchema = z.object({
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
});
