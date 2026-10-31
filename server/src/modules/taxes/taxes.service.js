import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';

export async function listTaxes(organizationId, { includeInactive = false } = {}) {
  return prisma.tax.findMany({
    where: { organizationId, ...(includeInactive ? {} : { isActive: true }) },
    orderBy: [{ isDefault: 'desc' }, { rate: 'asc' }],
  });
}

export async function getTax(id, organizationId) {
  const tax = await prisma.tax.findFirst({ where: { id, organizationId } });
  if (!tax) throw new NotFoundError('Tax configuration not found');
  return tax;
}

async function saveTax(id, organizationId, data, actor) {
  const tax = await prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.tax.updateMany({ where: { organizationId, ...(id ? { NOT: { id } } : {}) }, data: { isDefault: false } });
    }
    if (id) return tx.tax.update({ where: { id }, data });
    return tx.tax.create({ data: { organizationId, ...data } });
  });
  await recordAudit({ organizationId, userId: actor?.id, action: id ? 'tax.updated' : 'tax.created', resource: 'tax', resourceId: tax.id });
  return tax;
}

export const createTax = (organizationId, data, actor) => saveTax(null, organizationId, data, actor);

export async function updateTax(id, organizationId, data, actor) {
  const current = await getTax(id, organizationId);
  if (current.isDefault && data.isDefault === false) {
    const alternatives = await prisma.tax.count({ where: { organizationId, id: { not: id }, isDefault: true, isActive: true } });
    if (!alternatives) throw new ConflictError('Set another active default tax before disabling this one');
  }
  return saveTax(id, organizationId, data, actor);
}

export async function deactivateTax(id, organizationId, actor) {
  const tax = await getTax(id, organizationId);
  if (tax.isDefault) throw new ConflictError('Set another default tax before deactivating this one');
  const updated = await prisma.tax.update({ where: { id }, data: { isActive: false } });
  await recordAudit({ organizationId, userId: actor?.id, action: 'tax.deactivated', resource: 'tax', resourceId: id });
  return updated;
}
