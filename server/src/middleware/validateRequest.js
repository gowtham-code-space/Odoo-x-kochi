import { ValidationError } from '../errors/HttpErrors.js';

/**
 * Zod request validation middleware factory.
 *
 * Usage:
 *   router.post('/', validateRequest({ body: myZodSchema }), handler)
 *
 * @param {{ body?, query?, params? }} schemas - Zod schemas for each part
 */
export function validateRequest(schemas) {
  return (req, _res, next) => {
    const errors = [];

    for (const [part, schema] of Object.entries(schemas)) {
      if (!schema) continue;
      const result = schema.safeParse(req[part]);
      if (!result.success) {
        for (const issue of result.error.issues) {
          errors.push({
            field: issue.path.join('.'),
            message: issue.message,
          });
        }
      } else {
        req[part] = result.data; // replace with coerced/default values
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  };
}

