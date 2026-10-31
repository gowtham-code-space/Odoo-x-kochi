import { z } from 'zod';

const discountFields = {
  name: z.string().trim().min(2).max(200),
  code: z.string().trim().min(2).max(64).transform((value) => value.toUpperCase()),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive(),
  minAmount: z.number().min(0).optional().nullable(),
  minQuantity: z.number().int().min(1).optional().nullable(),
  productId: z.string().min(1).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  maxUsesPerCustomer: z.number().int().min(1).optional().nullable(),
  validFrom: z.string().datetime().optional().nullable(),
  validUntil: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
};

const withDiscountRules = (schema) => schema.superRefine((value, context) => {
  if (value.type === 'PERCENTAGE' && value.value > 100) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['value'], message: 'Percentage discount cannot exceed 100' });
  }
  if (value.validFrom && value.validUntil && new Date(value.validFrom) > new Date(value.validUntil)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ['validUntil'], message: 'End date must be after start date' });
  }
});

export const discountSchema = withDiscountRules(z.object(discountFields));
export const updateDiscountSchema = withDiscountRules(z.object(discountFields).partial().omit({ code: true }));
