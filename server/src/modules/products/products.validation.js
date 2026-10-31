import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').max(200),
  productType: z.string().min(2, 'Product type is required').max(100),
  salesPrice: z.number().min(0, 'Sales price cannot be negative'),
  costPrice: z.number().min(0, 'Cost price cannot be negative'),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  isActive: z.boolean().optional().default(true),
  availableFrom: z.string().datetime().optional().nullable(),
  availableUntil: z.string().datetime().optional().nullable(),
});

export const updateProductSchema = createProductSchema.partial();

export const createVariantSchema = z.object({
  name: z.string().min(2, 'Variant name must be at least 2 characters').max(200),
  sku: z.string().max(100).optional(),
  basePrice: z.number().positive('Base price must be positive'),
  priceAdjustment: z.number().min(-99999999).max(99999999).optional().default(0),
  priceAdjustmentPct: z.number().min(-100).max(1000).optional().nullable(),
  minQuantity: z.number().int().min(1).default(1),
  isActive: z.boolean().optional().default(true),
});

export const updateVariantSchema = createVariantSchema.partial();
