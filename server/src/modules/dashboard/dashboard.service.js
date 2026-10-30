import { prisma } from '../../config/database.js';

/**
 * Aggregate real statistics for the authenticated user's dashboard.
 * Returns actual DB counts — no fabricated numbers.
 */
export async function getDashboardStats(userId) {
  const [orgCount, membershipData, recentActivity] = await Promise.all([
    // Total organizations the user belongs to
    prisma.membership.count({ where: { userId } }),

    // All memberships with org and role
    prisma.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: { _count: { select: { memberships: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Recent audit log entries for all user's orgs
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        createdAt: true,
        organization: { select: { name: true } },
      },
    }),
  ]);

  const totalMembers = membershipData.reduce(
    (acc, m) => acc + (m.organization._count.memberships || 0),
    0
  );

  return {
    stats: {
      organizations: orgCount,
      totalMembers,
      recentActivityCount: recentActivity.length,
    },
    organizations: membershipData.map((m) => ({
      id: m.organization.id,
      name: m.organization.name,
      slug: m.organization.slug,
      role: m.role,
      memberCount: m.organization._count.memberships,
    })),
    recentActivity,
  };
}

