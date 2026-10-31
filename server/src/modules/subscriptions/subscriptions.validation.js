import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan is required'),
  quotationId: z.string().optional().nullable(),
  customerId: z.string().min(1).optional().nullable(),
  customerName: z.string().min(2, 'Customer name required').optional(),
  customerEmail: z.string().email('Valid email required').optional(),
  startDate: z.string().datetime('Valid start date required'),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0).optional(),
  discountId: z.string().optional().nullable(),
  taxRate: z.number().min(0).default(18),
  notes: z.string().max(2000).optional(),
});

export const updateSubscriptionSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  quantity: z.number().int().min(1).optional(),
  notes: z.string().max(2000).optional(),
});

export const changePlanSchema = z.object({
  planId: z.string().min(1),
  reason: z.string().trim().max(500).optional(),
});

export const renewSubscriptionSchema = z.object({
  endDate: z.string().datetime().optional(),
});
