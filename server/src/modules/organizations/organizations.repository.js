import { prisma } from '../../config/database.js';

export async function createOrganization({ name, slug, description, createdById }) {
  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: { name, slug, description, createdById },
    });

    await tx.membership.create({
      data: {
        userId: createdById,
        organizationId: org.id,
        role: 'OWNER',
      },
    });

    return tx.organization.findUnique({
      where: { id: org.id },
      include: {
        memberships: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { memberships: true } },
      },
    });
  });
}

export async function findOrgsByUserId(userId) {
  return prisma.organization.findMany({
    where: {
      memberships: { some: { userId } },
    },
    include: {
      memberships: {
        where: { userId },
        select: { role: true },
      },
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function findOrgById(orgId) {
  return prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: { select: { memberships: true } },
      memberships: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

export async function findSlug(slug) {
  return prisma.organization.findUnique({ where: { slug } });
}

export async function updateOrganization(orgId, data) {
  return prisma.organization.update({
    where: { id: orgId },
    data,
  });
}

