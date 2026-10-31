import { z } from 'zod';

export const updateBillingProfileSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  phone: z.string().trim().max(30).optional().nullable(),
  companyName: z.string().trim().max(200).optional().nullable(),
  gstin: z.string().trim().max(20).optional().nullable(),
  billingAddress: z.string().trim().max(500).optional().nullable(),
  city: z.string().trim().max(100).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  pincode: z.string().trim().max(20).optional().nullable(),
});

export const cancellationRequestSchema = z.object({
  reason: z.string().trim().min(3).max(500),
});
