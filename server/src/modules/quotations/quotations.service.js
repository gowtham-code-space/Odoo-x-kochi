import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import { calculateLine, sumMoney } from '../../utils/money.js';
import * as repo from './quotations.repository.js';

export const listQuotations = repo.findQuotations;

export async function getQuotation(id, organizationId) {
  const quotation = await repo.findQuotationById(id, organizationId);
  if (!quotation) throw new NotFoundError('Quotation not found');
  return quotation;
}

async function prepareQuotation(organizationId, input) {
  const data = { ...input };
  if (data.customerId) {
    const customer = await prisma.customer.findFirst({ where: { id: data.customerId, organizationId } });
    if (!customer) throw new NotFoundError('Customer not found');
    data.customerName = customer.name;
    data.customerEmail = customer.email;
  }

  const variantIds = data.lines.flatMap((line) => (line.productVariantId ? [line.productVariantId] : []));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds }, product: { organizationId } },
    include: { product: { select: { name: true } } },
  });
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
  if (variants.length !== variantIds.length) throw new NotFoundError('One or more product variants were not found');

  const lines = data.lines.map((line, index) => {
    const variant = line.productVariantId ? variantsById.get(line.productVariantId) : undefined;
    const unitPrice = variant ? Number(variant.basePrice) + Number(variant.priceAdjustment) : line.unitPrice;
    if (unitPrice === undefined) throw new ConflictError('A unit price is required for custom quotation lines');
    return {
      ...line,
      description: line.description || variant?.name || variant?.product.name,
      unitPrice: String(unitPrice),
      ...calculateLine({ ...line, unitPrice }),
      sortOrder: line.sortOrder ?? index,
    };
  });
  return {
    ...data,
    lines,
    subtotal: sumMoney(lines.map((line) => line.subtotal)),
    taxAmount: sumMoney(lines.map((line) => line.taxAmount)),
    total: sumMoney(lines.map((line) => line.total)),
  };
}

export async function createQuotation(organizationId, data, actor) {
  const quotation = await repo.createQuotation(organizationId, await prepareQuotation(organizationId, data));
  await recordAudit({ organizationId, userId: actor?.id, action: 'quotation.created', resource: 'quotation', resourceId: quotation.id });
  return quotation;
}

export async function updateQuotation(id, organizationId, data, actor) {
  const current = await getQuotation(id, organizationId);
  if (current.status !== 'DRAFT') throw new ConflictError('Only draft quotations can be edited');
  const prepared = data.lines ? await prepareQuotation(organizationId, { ...current, ...data }) : data;
  const quotation = await repo.updateQuotation(id, prepared);
  await recordAudit({ organizationId, userId: actor?.id, action: 'quotation.updated', resource: 'quotation', resourceId: id });
  return quotation;
}

async function transition(id, organizationId, from, to, actor) {
  const quotation = await getQuotation(id, organizationId);
  if (!from.includes(quotation.status)) throw new ConflictError(`Quotation cannot move from ${quotation.status} to ${to}`);
  const updated = await repo.setQuotationStatus(id, to);
  await recordAudit({ organizationId, userId: actor?.id, action: `quotation.${to.toLowerCase()}`, resource: 'quotation', resourceId: id });
  return updated;
}

export const sendQuotation = (id, organizationId, actor) => transition(id, organizationId, ['DRAFT'], 'SENT', actor);
export const acceptQuotation = (id, organizationId, actor) => transition(id, organizationId, ['DRAFT', 'SENT', 'CONFIRMED'], 'ACCEPTED', actor);
export const confirmQuotation = acceptQuotation;
export const rejectQuotation = (id, organizationId, actor) => transition(id, organizationId, ['DRAFT', 'SENT'], 'REJECTED', actor);
export const cancelQuotation = (id, organizationId, actor) => transition(id, organizationId, ['DRAFT', 'SENT', 'ACCEPTED'], 'CANCELLED', actor);
