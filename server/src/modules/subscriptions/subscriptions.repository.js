import { prisma } from '../../config/database.js';

const subscriptionInclude = {
  customer: { select: { id: true, name: true, email: true } },
  plan: { select: { id: true, name: true, billingFrequency: true, product: { select: { name: true } } } },
  discount: { select: { id: true, name: true, type: true, value: true } },
  _count: { select: { invoices: true } },
};

export async function findSubscriptions(organizationId, { page = 1, limit = 20, search, status, planId, customerId } = {}) {
  const where = {
    organizationId,
    ...(status ? { status } : {}),
    ...(planId ? { planId } : {}),
    ...(customerId ? { customerId } : {}),
    ...(search
      ? {
          OR: [
            { number: { contains: search, mode: 'insensitive' } },
            { customerName: { contains: search, mode: 'insensitive' } },
            { customerEmail: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({ where, include: subscriptionInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.subscription.count({ where }),
  ]);
  return { subscriptions, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function findSubscriptionById(id, organizationId) {
  return prisma.subscription.findFirst({
    where: { id, organizationId },
    include: {
      customer: true,
      plan: { include: { product: true } },
      discount: true,
      _count: { select: { invoices: true } },
      quotation: true,
      invoices: { orderBy: { issueDate: 'desc' }, take: 20 },
      history: { orderBy: { createdAt: 'desc' }, take: 50 },
    },
  });
}

function subscriptionNumber(count) {
  return `SUB/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
}

export async function createSubscription(organizationId, data, actorId) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.subscription.count({ where: { organizationId } });
    const subscription = await tx.subscription.create({
      data: { ...data, organizationId, number: subscriptionNumber(count) },
      include: subscriptionInclude,
    });
    await tx.subscriptionHistory.create({
      data: { organizationId, subscriptionId: subscription.id, toStatus: subscription.status, reason: 'Subscription created', changedById: actorId },
    });
    return subscription;
  });
}

export async function updateSubscription(id, data) {
  return prisma.subscription.update({ where: { id }, data, include: subscriptionInclude });
}

export async function transitionSubscription(id, organizationId, fromStatus, toStatus, reason, actorId, fields = {}) {
  return prisma.$transaction(async (tx) => {
    const result = await tx.subscription.updateMany({ where: { id, organizationId, status: fromStatus }, data: { status: toStatus, ...fields } });
    if (result.count !== 1) return null;
    await tx.subscriptionHistory.create({
      data: { organizationId, subscriptionId: id, fromStatus, toStatus, reason, changedById: actorId },
    });
    return tx.subscription.findUnique({ where: { id }, include: subscriptionInclude });
  });
}

export function findDueSubscriptions(now = new Date()) {
  return prisma.subscription.findMany({
    where: { status: 'ACTIVE', nextBillingDate: { lte: now } },
    include: { plan: { include: { product: true } }, customer: true, discount: true, organization: true },
  });
}
