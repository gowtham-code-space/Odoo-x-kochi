import { z } from 'zod';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().positive(),
  method: z.enum(['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'CARD', 'NEFT', 'RTGS', 'IMPS']),
  reference: z.string().trim().min(2).max(200),
  paidAt: z.string().datetime().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const initiatePaymentSchema = z.object({
  invoiceId: z.string().min(1),
  provider: z.string().trim().min(2).max(60),
});
