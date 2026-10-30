/**
 * Base application error class.
 * isOperational = true means it's an expected, handled error
 * (not a programming bug) — safe to send to client.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

