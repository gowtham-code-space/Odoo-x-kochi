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
});

