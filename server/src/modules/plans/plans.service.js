import { NotFoundError, ConflictError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import * as repo from './plans.repository.js';

export async function listPlans(organizationId, query) {
  return repo.findPlans(organizationId, query);
}

export async function getPlan(id, organizationId) {
  const plan = await repo.findPlanById(id, organizationId);
  if (!plan) throw new NotFoundError('Plan not found');
  return plan;
}

function assertAvailabilityWindow(data) {
  if (data.availableFrom && data.availableUntil && new Date(data.availableFrom) > new Date(data.availableUntil)) {
    throw new ConflictError('Availability end date must be after the start date');
  }
}

async function assertOrganizationProduct(productId, organizationId) {
  const product = await prisma.product.findFirst({ where: { id: productId, organizationId }, select: { id: true } });
  if (!product) throw new NotFoundError('Product not found');
}

export async function createPlan(organizationId, data, actor) {
  assertAvailabilityWindow(data);
  await assertOrganizationProduct(data.productId, organizationId);
  const plan = await repo.createPlan(organizationId, data);
  await recordAudit({ organizationId, userId: actor?.id, action: 'plan.created', resource: 'plan', resourceId: plan.id });
  return plan;
}

export async function updatePlan(id, organizationId, data, actor) {
  const plan = await getPlan(id, organizationId);
  assertAvailabilityWindow({ availableFrom: data.availableFrom ?? plan.availableFrom, availableUntil: data.availableUntil ?? plan.availableUntil });
  const updated = await repo.updatePlan(id, organizationId, data);
  await recordAudit({ organizationId, userId: actor?.id, action: 'plan.updated', resource: 'plan', resourceId: id });
  return updated;
}

export async function archivePlan(id, organizationId, actor) {
  const plan = await repo.findPlanById(id, organizationId);
  if (!plan) throw new NotFoundError('Plan not found');
  if (plan.status === 'ARCHIVED') throw new ConflictError('Plan is already archived');
  const archived = await repo.archivePlan(id, organizationId);
  await recordAudit({ organizationId, userId: actor?.id, action: 'plan.archived', resource: 'plan', resourceId: id });
  return archived;
}

export async function activatePlan(id, organizationId, actor) {
  const plan = await repo.findPlanById(id, organizationId);
  if (!plan) throw new NotFoundError('Plan not found');
  const activated = await repo.updatePlan(id, organizationId, { status: 'ACTIVE' });
  await recordAudit({ organizationId, userId: actor?.id, action: 'plan.activated', resource: 'plan', resourceId: id });
  return activated;
}
