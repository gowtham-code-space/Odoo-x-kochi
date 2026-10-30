import bcrypt from 'bcryptjs';
import { signToken } from '../../config/security.js';
import { findUserByEmail, findUserById, createUser } from './auth.repository.js';
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

