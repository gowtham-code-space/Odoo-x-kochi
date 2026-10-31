import { prisma } from '../../config/database.js';

/**
 * Find a user by email.
 */
export async function findUserByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

/**
 * Find a user by ID, excluding the password hash.
 */
export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

/**
 * Create a new user record.
 */
export async function createUser({ name, email, passwordHash }) {
  return prisma.user.create({
    data: { name, email, passwordHash },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function findUserForPasswordReset(resetToken) {
  return prisma.user.findFirst({ where: { resetToken, resetExpiry: { gt: new Date() } } });
}

export function setPasswordResetToken(id, resetToken, resetExpiry) {
  return prisma.user.update({ where: { id }, data: { resetToken, resetExpiry } });
}

export function clearPasswordResetToken(id, passwordHash) {
  return prisma.user.update({ where: { id }, data: { passwordHash, resetToken: null, resetExpiry: null } });
}

