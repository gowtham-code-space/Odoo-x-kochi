import { z } from 'zod';
import { LIMITS } from '../../constants/limits.js';

export const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(LIMITS.MAX_ORG_NAME_LENGTH, `Organization name must be at most ${LIMITS.MAX_ORG_NAME_LENGTH} characters`),
  description: z.string().max(LIMITS.MAX_DESCRIPTION_LENGTH).optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2).max(LIMITS.MAX_ORG_NAME_LENGTH).optional(),
  description: z.string().max(LIMITS.MAX_DESCRIPTION_LENGTH).optional(),
  gstin: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  role: z.enum(['STAFF', 'CUSTOMER']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['STAFF', 'CUSTOMER']),
});

export const organizationSettingSchema = z.object({
  currency: z.string().trim().length(3).optional(),
  timezone: z.string().trim().min(1).max(100).optional(),
  invoicePrefix: z.string().trim().min(1).max(20).optional(),
  notificationPreferences: z.record(z.boolean()).optional().nullable(),
});

