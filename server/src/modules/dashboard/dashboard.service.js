import { prisma } from '../../config/database.js';
import { fromPaise, toPaise } from '../../utils/money.js';

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

function normalizedMonthlyRevenue(subscription) {
  const gross = toPaise(subscription.unitPrice) * BigInt(subscription.quantity);
  switch (subscription.plan.billingFrequency) {
    case 'DAILY': return gross * 30n;
    case 'WEEKLY': return (gross * 52n + 6n) / 12n;
    case 'QUARTERLY': return gross / 3n;
    case 'SEMI_ANNUAL': return gross / 6n;
    case 'ANNUAL': return gross / 12n;
    default: return gross;
  }
}

/**
 * Tenant-scoped operational metrics. MRR is normalized to a monthly value
 * from active subscriptions; ARR is MRR × 12. Revenue is settled payments,
 * never a fabricated projection.
 */
export async function getOrganizationDashboard(organizationId, role, userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const [
    subscriptions,
    customers,
    overdueInvoices,
    pendingSubscriptions,
    closedSubscriptions,
    payments,
    quotations,
    recentSubscriptions,
    recentPayments,
  ] = await Promise.all([
    prisma.subscription.findMany({ where: { organizationId, status: { in: ['ACTIVE', 'IN_PROGRESS'] } }, include: { plan: { select: { billingFrequency: true } } } }),
    prisma.customer.count({ where: { organizationId, isActive: true } }),
    prisma.invoice.count({ where: { organizationId, status: 'OVERDUE' } }),
    prisma.subscription.count({ where: { organizationId, status: { in: ['DRAFT', 'CONFIRMED', 'QUOTATION'] } } }),
    prisma.subscription.count({ where: { organizationId, status: 'CLOSED' } }),
    prisma.payment.findMany({ where: { organizationId, status: 'SUCCEEDED' }, select: { amount: true, paidAt: true } }),
    prisma.quotation.count({ where: { organizationId, status: { in: ['DRAFT', 'SENT'] } } }),
    prisma.subscription.findMany({ where: { organizationId }, include: { plan: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
    prisma.payment.findMany({ where: { organizationId, status: 'SUCCEEDED' }, include: { invoice: { select: { number: true, customerName: true } } }, orderBy: { paidAt: 'desc' }, take: 5 }),
  ]);
  const mrrPaise = subscriptions.reduce((total, subscription) => total + normalizedMonthlyRevenue(subscription), 0n);
  const revenuePaise = payments.reduce((total, payment) => total + toPaise(payment.amount), 0n);
  const monthlyRevenuePaise = payments
    .filter((payment) => payment.paidAt >= startOfMonth)
    .reduce((total, payment) => total + toPaise(payment.amount), 0n);

  return {
    methodology: {
      revenue: 'Sum of succeeded payment records.',
      mrr: 'Active subscription price × quantity normalized to one month.',
      arr: 'MRR multiplied by 12.',
    },
    role,
    metrics: {
      totalRevenue: fromPaise(revenuePaise),
      monthlyRevenue: fromPaise(monthlyRevenuePaise),
      mrr: fromPaise(mrrPaise),
      arr: fromPaise(mrrPaise * 12n),
      activeSubscriptions: subscriptions.length,
      pendingSubscriptions,
      cancelledSubscriptions: closedSubscriptions,
      totalCustomers: customers,
      overdueInvoices,
      openQuotations: quotations,
    },
    recentSubscriptions,
    recentPayments,
  };
}

