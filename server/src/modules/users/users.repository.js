import { prisma } from '../../config/database.js';

export async function findUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, phone: true, createdAt: true, updatedAt: true },
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, phone: true, createdAt: true, updatedAt: true },
  });
}

