import { AppError } from '../errors/AppError.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

/**
 * Centralized error handler middleware.
 * Must be the last middleware registered in app.js.
 *
 * - Operational errors (AppError): return structured error response
 * - Unexpected errors: log details, return generic 500 (no internals leaked in prod)
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  const requestId = req.id || 'unknown';

  if (err instanceof AppError && err.isOperational) {
    // Known, expected error — safe to surface to client
    const body = {
      error: {
        message: err.message,
        code: err.code,
        requestId,
      },
    };

    if (err.errors) {
      body.error.errors = err.errors;
    }

    return res.status(err.statusCode).json(body);
  }

  // Unexpected / programming error
  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    requestId,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({
    error: {
      message: env.isProd
        ? 'An unexpected error occurred. Please try again.'
        : err.message,
      code: 'INTERNAL_ERROR',
      requestId,
      ...(env.isDev && { stack: err.stack }),
    },
  });
}

