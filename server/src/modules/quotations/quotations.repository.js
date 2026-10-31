import { prisma } from '../../config/database.js';

function quotationNumber(count) {
  return `Q/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
}

export async function findQuotations(organizationId, { page = 1, limit = 20, search, status } = {}) {
  const where = {
    organizationId,
    ...(status ? { status } : {}),
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
  const [quotations, total] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        lines: true,
        subscription: { select: { id: true, number: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quotation.count({ where }),
  ]);
  return { quotations, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function findQuotationById(id, organizationId) {
  return prisma.quotation.findFirst({
    where: { id, organizationId },
    include: {
      customer: true,
      lines: { include: { productVariant: { select: { id: true, name: true } } }, orderBy: { sortOrder: 'asc' } },
      subscription: true,
    },
  });
}

export async function createQuotation(organizationId, data) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.quotation.count({ where: { organizationId } });
    return tx.quotation.create({
      data: { ...data, organizationId, number: quotationNumber(count), lines: { create: data.lines } },
      include: { customer: true, lines: true },
    });
  });
}

export async function updateQuotation(id, data) {
  return prisma.$transaction(async (tx) => {
    if (data.lines) await tx.quotationLine.deleteMany({ where: { quotationId: id } });
    return tx.quotation.update({
      where: { id },
      data: { ...data, ...(data.lines ? { lines: { create: data.lines } } : {}) },
      include: { customer: true, lines: true },
    });
  });
}

export function setQuotationStatus(id, status) {
  return prisma.quotation.update({ where: { id }, data: { status } });
}
