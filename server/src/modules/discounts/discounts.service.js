import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';

export async function listDiscounts(organizationId, { page = 1, limit = 20, search, isActive } = {}) {
  const where = {
    organizationId,
    ...(isActive === undefined ? {} : { isActive }),
    ...(search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { code: { contains: search, mode: 'insensitive' } }] } : {}),
  };
  const [discounts, total] = await Promise.all([
    prisma.discount.findMany({ where, include: { product: { select: { id: true, name: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.discount.count({ where }),
  ]);
  return { discounts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getDiscount(id, organizationId) {
  const discount = await prisma.discount.findFirst({ where: { id, organizationId }, include: { product: true } });
  if (!discount) throw new NotFoundError('Discount not found');
  return discount;
}

async function assertProduct(organizationId, productId) {
  if (!productId) return;
  if (!await prisma.product.findFirst({ where: { id: productId, organizationId }, select: { id: true } })) {
    throw new NotFoundError('Product not found');
  }
}

export async function createDiscount(organizationId, data, actor) {
  await assertProduct(organizationId, data.productId);
  try {
    const discount = await prisma.discount.create({ data: { ...data, organizationId } });
    await recordAudit({ organizationId, userId: actor?.id, action: 'discount.created', resource: 'discount', resourceId: discount.id });
    return discount;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError('A discount with this code already exists');
    throw error;
  }
}

export async function updateDiscount(id, organizationId, data, actor) {
  await getDiscount(id, organizationId);
  await assertProduct(organizationId, data.productId);
  const discount = await prisma.discount.update({ where: { id }, data });
  await recordAudit({ organizationId, userId: actor?.id, action: 'discount.updated', resource: 'discount', resourceId: id });
  return discount;
}
