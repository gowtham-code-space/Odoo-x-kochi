import { SignJWT, jwtVerify } from 'jose';
import { env } from './env.js';

const secret = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Sign a JWT with the given payload.
 * @param {object} payload - Data to encode (userId, email, name)
 * @param {string} [expiresIn] - Expiry string like "7d"
 * @returns {Promise<string>} Signed JWT string
 */
export async function signToken(payload, expiresIn = env.JWT_EXPIRES_IN) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

/**
 * Verify a JWT and return its payload.
 * @param {string} token
 * @returns {Promise<object>} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export const COOKIE_NAME = 'nexus_session';

/**
 * Cookie options for HTTP-only session cookie.
 */
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  path: '/',
};

/**
 * Clear cookie options (for logout).
 */
export const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'lax',
  path: '/',
};

