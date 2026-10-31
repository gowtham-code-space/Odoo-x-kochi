import { z } from 'zod';

const lineSchema = z.object({
  productVariantId: z.string().optional().nullable(),
  description: z.string().min(1, 'Description required'),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0).optional(),
  discountPct: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).default(18),
  sortOrder: z.number().int().default(0),
});

export const createQuotationSchema = z.object({
  customerId: z.string().min(1).optional().nullable(),
  customerName: z.string().min(2, 'Customer name required').optional(),
  customerEmail: z.string().email('Valid email required').optional(),
  validUntil: z.string().datetime().optional().nullable(),
  notes: z.string().max(2000).optional(),
  lines: z.array(lineSchema).min(1, 'At least one line item required'),
});

export const updateQuotationSchema = createQuotationSchema.partial();

export const sendQuotationSchema = z.object({});
export const confirmQuotationSchema = z.object({});
export const cancelQuotationSchema = z.object({
  reason: z.string().optional(),
});
