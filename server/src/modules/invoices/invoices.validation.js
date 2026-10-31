import { z } from 'zod';

const lineSchema = z.object({
  description: z.string().trim().min(1).max(500),
  quantity: z.number().int().min(1),
  unitPrice: z.number().min(0),
  taxRate: z.number().min(0).max(100).default(18),
  sortOrder: z.number().int().min(0).optional(),
});

export const createInvoiceSchema = z.object({
  subscriptionId: z.string().min(1).optional().nullable(),
  customerId: z.string().min(1).optional().nullable(),
  customerName: z.string().trim().min(2).max(200).optional(),
  customerEmail: z.string().email().optional(),
  gstin: z.string().trim().max(20).optional().nullable(),
  dueDate: z.string().datetime(),
  periodStart: z.string().datetime().optional().nullable(),
  periodEnd: z.string().datetime().optional().nullable(),
  discountCode: z.string().trim().max(64).optional().nullable(),
  notes: z.string().trim().max(2000).optional(),
  lines: z.array(lineSchema).min(1),
});

export const updateInvoiceSchema = z.object({
  dueDate: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
});
