import { verifyToken, COOKIE_NAME } from '../config/security.js';
import { UnauthorizedError } from '../errors/HttpErrors.js';

/**
 * Authenticate middleware.
 * Reads JWT from the HTTP-only cookie, verifies it,
 * and attaches req.user = { id, email, name } to the request.
 * Throws UnauthorizedError if cookie is absent or token is invalid/expired.
 */
export async function authenticate(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    throw new UnauthorizedError('Authentication required');
  }

  try {
    const payload = await verifyToken(token);
    req.user = {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch {
    throw new UnauthorizedError('Session expired — please sign in again');
  }
}

