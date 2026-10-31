import { prisma } from '../../config/database.js';

export async function findProducts(organizationId, { page = 1, limit = 20, search, isActive } = {}) {
  const skip = (page - 1) * limit;
  const where = {
    organizationId,
    ...(isActive !== undefined ? { isActive } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { variants: true, _count: { select: { plans: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findProductById(id, organizationId) {
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: { variants: true, plans: true },
  });
}

export async function createProduct(organizationId, data) {
  return prisma.product.create({
    data: { ...data, organizationId },
    include: { variants: true },
  });
}

export async function updateProduct(id, organizationId, data) {
  return prisma.product.update({
    where: { id },
    data,
    include: { variants: true },
  });
}

export async function deleteProduct(id, organizationId) {
  return prisma.product.delete({ where: { id } });
}

// Variants
export async function findVariantById(id, productId) {
  return prisma.productVariant.findFirst({ where: { id, productId } });
}

export async function createVariant(productId, data) {
  return prisma.productVariant.create({ data: { ...data, productId } });
}

export async function updateVariant(id, data) {
  return prisma.productVariant.update({ where: { id }, data });
}

export async function deleteVariant(id) {
  return prisma.productVariant.delete({ where: { id } });
}
