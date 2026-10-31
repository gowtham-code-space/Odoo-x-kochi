import { NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { fromPaise, toPaise } from '../../utils/money.js';

async function getCustomer(userId, organizationId) {
  const customer = await prisma.customer.findFirst({ where: { userId, organizationId, isActive: true } });
  if (!customer) throw new NotFoundError('Customer profile not found for this organization');
  return customer;
}

export async function getPortalDashboard(userId, organizationId) {
  const customer = await getCustomer(userId, organizationId);
  const [subscriptions, invoices, payments] = await Promise.all([
    prisma.subscription.findMany({ where: { organizationId, customerId: customer.id }, include: { plan: { select: { id: true, name: true, billingFrequency: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.invoice.findMany({ where: { organizationId, customerId: customer.id }, orderBy: { issueDate: 'desc' } }),
    prisma.payment.findMany({ where: { organizationId, invoice: { customerId: customer.id } }, include: { invoice: { select: { number: true } } }, orderBy: { paidAt: 'desc' } }),
  ]);
  const balance = invoices.reduce((total, invoice) => total + toPaise(invoice.amountDue), 0n);
  return {
    customer,
    subscriptions,
    invoices,
    payments,
    metrics: {
      activeSubscriptions: subscriptions.filter((subscription) => ['ACTIVE', 'IN_PROGRESS'].includes(subscription.status)).length,
      balanceDue: fromPaise(balance),
      invoiceCount: invoices.length,
      nextRenewal: subscriptions.find((subscription) => subscription.nextBillingDate)?.nextBillingDate || null,
    },
  };
}

export async function updateBillingProfile(userId, organizationId, data) {
  const customer = await getCustomer(userId, organizationId);
  return prisma.customer.update({ where: { id: customer.id }, data });
}

export async function requestCancellation(userId, organizationId, subscriptionId, reason) {
  const customer = await getCustomer(userId, organizationId);
  const subscription = await prisma.subscription.findFirst({ where: { id: subscriptionId, organizationId, customerId: customer.id } });
  if (!subscription) throw new NotFoundError('Subscription not found');
  return prisma.notification.create({
    data: {
      organizationId,
      type: 'SUBSCRIPTION_CANCELLATION_REQUEST',
      title: 'Cancellation request',
      body: `Customer requested cancellation for ${subscription.number}: ${reason}`,
      metadata: { subscriptionId, customerId: customer.id, requestedBy: userId },
    },
  });
}
