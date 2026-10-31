import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { signToken } from '../../config/security.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  findUserForPasswordReset,
  setPasswordResetToken,
  clearPasswordResetToken,
} from './auth.repository.js';
import { ConflictError, UnauthorizedError } from '../../errors/HttpErrors.js';
import { LIMITS } from '../../constants/limits.js';

/**
 * Register a new user.
 * Returns the created user (no password hash) and a signed JWT.
 */
export async function register({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, LIMITS.BCRYPT_ROUNDS);
  const user = await createUser({ name, email, passwordHash });

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  return { user, token };
}

/**
 * Authenticate a user with email and password.
 * Returns the user and a signed JWT on success.
 */
export async function login({ email, password }) {
  const userWithHash = await findUserByEmail(email);

  // Always compare even if user not found (timing-safe)
  const dummyHash = '$2a$12$invalidhashthatalwaaysfails00000000000000000000000';
  const isValid = await bcrypt.compare(password, userWithHash?.passwordHash ?? dummyHash);

  if (!userWithHash || !isValid) {
    throw new UnauthorizedError('Incorrect email or password');
  }

  const user = {
    id: userWithHash.id,
    email: userWithHash.email,
    name: userWithHash.name,
    createdAt: userWithHash.createdAt,
    updatedAt: userWithHash.updatedAt,
  };

  const token = await signToken({ userId: user.id, email: user.email, name: user.name });
  return { user, token };
}

/**
 * Retrieve the current authenticated user by ID.
 */
export async function getCurrentUser(userId) {
  return findUserById(userId);
}

const digestResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Always returns successfully to prevent email enumeration. A mail delivery
 * provider can consume the opaque token internally; it is never returned by
 * this API or written to logs.
 */
export async function requestPasswordReset(email) {
  const user = await findUserByEmail(email);
  if (!user) return;
  const token = crypto.randomBytes(32).toString('hex');
  await setPasswordResetToken(user.id, digestResetToken(token), new Date(Date.now() + 60 * 60 * 1000));
  // Email delivery intentionally remains an integration concern. Do not expose
  // the token via API responses, logs, or the browser.
}

export async function resetPassword(token, password) {
  const user = await findUserForPasswordReset(digestResetToken(token));
  if (!user) throw new UnauthorizedError('This password reset link is invalid or has expired');
  const passwordHash = await bcrypt.hash(password, LIMITS.BCRYPT_ROUNDS);
  await clearPasswordResetToken(user.id, passwordHash);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await findUserByEmail((await findUserById(userId))?.email);
  if (!user || !await bcrypt.compare(currentPassword, user.passwordHash)) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  const passwordHash = await bcrypt.hash(newPassword, LIMITS.BCRYPT_ROUNDS);
  await clearPasswordResetToken(user.id, passwordHash);
}

