import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import { createOrganizationNotification } from '../../utils/notifications.js';
import { isPlanAvailable, nextBillingDate } from '../../utils/billing.js';
import * as repo from './subscriptions.repository.js';

export const listSubscriptions = repo.findSubscriptions;

export async function getSubscription(id, organizationId) {
  const subscription = await repo.findSubscriptionById(id, organizationId);
  if (!subscription) throw new NotFoundError('Subscription not found');
  return subscription;
}

async function resolveCreationData(organizationId, input) {
  const plan = await prisma.plan.findFirst({ where: { id: input.planId, organizationId }, include: { product: true } });
  if (!plan) throw new NotFoundError('Plan not found');
  if (!isPlanAvailable(plan, new Date(input.startDate))) throw new ConflictError('Plan is not available for this subscription date');
  if (input.quantity < plan.minQuantity) throw new ConflictError(`Plan requires a minimum quantity of ${plan.minQuantity}`);

  const data = { ...input, unitPrice: String(plan.basePrice), paymentTermsDays: plan.paymentTermsDays };
  if (input.customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: input.customerId, organizationId, isActive: true } });
    if (!customer) throw new NotFoundError('Customer not found');
    data.customerName = customer.name;
    data.customerEmail = customer.email;
  }
  if (input.quotationId) {
    const quotation = await prisma.quotation.findFirst({ where: { id: input.quotationId, organizationId } });
    if (!quotation) throw new NotFoundError('Quotation not found');
    if (!['ACCEPTED', 'CONFIRMED'].includes(quotation.status)) throw new ConflictError('Only an accepted quotation can be converted');
    data.customerId = quotation.customerId;
    data.customerName = quotation.customerName;
    data.customerEmail = quotation.customerEmail;
  }
  if (input.discountId) {
    const discount = await prisma.discount.findFirst({ where: { id: input.discountId, organizationId, isActive: true } });
    if (!discount) throw new NotFoundError('Discount not found');
    if (discount.productId && discount.productId !== plan.productId) {
      throw new ConflictError('Discount is not applicable to the selected plan product');
    }
  }
  if (!data.customerName || !data.customerEmail) throw new ConflictError('A customer is required');

  const startDate = new Date(input.startDate);
  const nextBill = plan.trialDays > 0
    ? new Date(startDate.getTime() + plan.trialDays * 24 * 60 * 60 * 1000)
    : nextBillingDate(startDate, plan.billingFrequency);

  return {
    ...data,
    startDate,
    nextBillingDate: nextBill,
    status: input.quotationId ? 'CONFIRMED' : 'DRAFT',
  };
}

export async function createSubscription(organizationId, data, actor) {
  try {
    const subscription = await repo.createSubscription(organizationId, await resolveCreationData(organizationId, data), actor?.id);
    await recordAudit({ organizationId, userId: actor?.id, action: 'subscription.created', resource: 'subscription', resourceId: subscription.id });
    return subscription;
  } catch (error) {
    if (error.code === 'P2002' && data.quotationId) throw new ConflictError('This quotation has already been converted to a subscription');
    throw error;
  }
}

export async function updateSubscription(id, organizationId, data, actor) {
  const current = await getSubscription(id, organizationId);
  if (!['DRAFT', 'CONFIRMED'].includes(current.status)) throw new ConflictError('Only draft or confirmed subscriptions can be edited');
  const updated = await repo.updateSubscription(id, data);
  await recordAudit({ organizationId, userId: actor?.id, action: 'subscription.updated', resource: 'subscription', resourceId: id });
  return updated;
}

async function transition(id, organizationId, expected, target, actor, reason, fields) {
  const current = await getSubscription(id, organizationId);
  if (!expected.includes(current.status)) throw new ConflictError(`Subscription cannot move from ${current.status} to ${target}`);
  const updated = await repo.transitionSubscription(id, organizationId, current.status, target, reason, actor?.id, fields);
  if (!updated) throw new ConflictError('Subscription was changed by another request; retry the operation');
  await recordAudit({ organizationId, userId: actor?.id, action: `subscription.${target.toLowerCase()}`, resource: 'subscription', resourceId: id });
  await createOrganizationNotification({
    organizationId,
    type: 'SUBSCRIPTION_' + target,
    title: 'Subscription ' + target.toLowerCase(),
    body: 'Subscription ' + updated.number + ' is now ' + target.toLowerCase() + '.',
    metadata: { subscriptionId: updated.id, customerId: updated.customerId },
  });
  return updated;
}

export const activateSubscription = (id, organizationId, actor) => transition(id, organizationId, ['DRAFT', 'CONFIRMED'], 'ACTIVE', actor, 'Subscription activated');

export async function pauseSubscription(id, organizationId, actor) {
  const current = await getSubscription(id, organizationId);
  if (!current.plan.allowPause) throw new ConflictError('This plan does not allow pausing');
  return transition(id, organizationId, ['ACTIVE', 'IN_PROGRESS'], 'PAUSED', actor, 'Subscription paused');
}

export const resumeSubscription = (id, organizationId, actor) => transition(id, organizationId, ['PAUSED'], 'ACTIVE', actor, 'Subscription resumed');

export async function closeSubscription(id, organizationId, actor, reason) {
  const current = await getSubscription(id, organizationId);
  if (!current.plan.allowEarlyClose && !current.endDate) throw new ConflictError('This plan does not allow early closure');
  return transition(id, organizationId, ['DRAFT', 'CONFIRMED', 'ACTIVE', 'IN_PROGRESS', 'PAUSED'], 'CLOSED', actor, reason || 'Subscription closed', { endDate: new Date() });
}

export async function renewSubscription(id, organizationId, data, actor) {
  const current = await getSubscription(id, organizationId);
  if (!current.plan.allowRenewal) throw new ConflictError('This plan does not allow renewal');
  if (!['ACTIVE', 'IN_PROGRESS', 'EXPIRED'].includes(current.status)) throw new ConflictError('Only active or expired subscriptions can be renewed');
  const start = data.endDate ? new Date(data.endDate) : (current.nextBillingDate || new Date());
  return transition(id, organizationId, [current.status], 'ACTIVE', actor, 'Subscription renewed', {
    startDate: start,
    endDate: null,
    nextBillingDate: nextBillingDate(start, current.plan.billingFrequency),
  });
}

export async function changePlan(id, organizationId, planId, actor, reason) {
  const current = await getSubscription(id, organizationId);
  if (!['DRAFT', 'CONFIRMED', 'ACTIVE', 'PAUSED'].includes(current.status)) throw new ConflictError('This subscription cannot change plans');
  const plan = await prisma.plan.findFirst({ where: { id: planId, organizationId } });
  if (!plan || !isPlanAvailable(plan)) throw new NotFoundError('New plan is not available');
  if (current.quantity < plan.minQuantity) throw new ConflictError(`New plan requires a minimum quantity of ${plan.minQuantity}`);
  const updated = await repo.updateSubscription(id, {
    planId: plan.id,
    unitPrice: plan.basePrice,
    paymentTermsDays: plan.paymentTermsDays,
    nextBillingDate: nextBillingDate(new Date(), plan.billingFrequency),
  });
  await prisma.subscriptionHistory.create({
    data: { organizationId, subscriptionId: id, fromStatus: current.status, toStatus: current.status, reason: reason || `Plan changed to ${plan.name}`, changedById: actor?.id },
  });
  await recordAudit({ organizationId, userId: actor?.id, action: 'subscription.plan_changed', resource: 'subscription', resourceId: id, metadata: { planId } });
  return updated;
}
