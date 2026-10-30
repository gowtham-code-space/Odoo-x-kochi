import rateLimit from 'express-rate-limit';

const baseOptions = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' } },
};

/** General API rate limiter: 200 req / 15 min */
export const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 200,
});

/** Auth endpoints: 10 attempts / 15 min */
export const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: {
      message: 'Too many authentication attempts. Please wait 15 minutes.',
      code: 'RATE_LIMITED',
    },
  },
});

/** Analytics queries: 30 req / 5 min */
export const analyticsLimiter = rateLimit({
  ...baseOptions,
  windowMs: 5 * 60 * 1000,
  max: 30,
});

