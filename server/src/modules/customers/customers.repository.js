import { prisma } from '../../config/database.js';

const customerInclude = {
  _count: { select: { subscriptions: true, invoices: true, quotations: true } },
};

export async function findCustomers(organizationId, { page = 1, limit = 20, search, isActive } = {}) {
  const where = {
    organizationId,
    ...(isActive === undefined ? {} : { isActive }),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: customerInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);
  return { customers, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function findCustomerById(id, organizationId) {
  return prisma.customer.findFirst({
    where: { id, organizationId },
    include: {
      ...customerInclude,
      subscriptions: { include: { plan: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      invoices: { orderBy: { issueDate: 'desc' }, take: 20 },
    },
  });
}

export function createCustomer(organizationId, data) {
  return prisma.customer.create({ data: { ...data, organizationId }, include: customerInclude });
}

export function updateCustomer(id, organizationId, data) {
  return prisma.customer.update({ where: { id }, data, include: customerInclude });
}
