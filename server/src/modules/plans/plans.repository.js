import { prisma } from '../../config/database.js';

export async function findPlans(organizationId, { page = 1, limit = 20, search, status, productId } = {}) {
  const skip = (page - 1) * limit;
  const where = {
    organizationId,
    ...(status ? { status } : {}),
    ...(productId ? { productId } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [plans, total] = await Promise.all([
    prisma.plan.findMany({
      where,
      include: {
        product: { select: { id: true, name: true } },
        _count: { select: { subscriptions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.plan.count({ where }),
  ]);

  return { plans, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findPlanById(id, organizationId) {
  return prisma.plan.findFirst({
    where: { id, organizationId },
    include: {
      product: true,
      _count: { select: { subscriptions: true } },
    },
  });
}

export async function createPlan(organizationId, data) {
  return prisma.plan.create({
    data: { ...data, organizationId },
    include: { product: { select: { id: true, name: true } } },
  });
}

export async function updatePlan(id, organizationId, data) {
  return prisma.plan.update({
    where: { id },
    data,
    include: { product: { select: { id: true, name: true } } },
  });
}

export async function archivePlan(id, organizationId) {
  return prisma.plan.update({ where: { id }, data: { status: 'ARCHIVED' } });
}
