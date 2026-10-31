import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import * as repository from './customers.repository.js';

export const listCustomers = repository.findCustomers;

export async function getCustomer(id, organizationId) {
  const customer = await repository.findCustomerById(id, organizationId);
  if (!customer) throw new NotFoundError('Customer not found');
  return customer;
}

export async function createCustomer(organizationId, data, actor) {
  if (data.userId) {
    const membership = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: data.userId, organizationId } },
    });
    if (!membership || membership.role !== 'CUSTOMER') {
      throw new ConflictError('Linked user must be a CUSTOMER member of this organization');
    }
  }
  try {
    const customer = await repository.createCustomer(organizationId, data);
    await recordAudit({ organizationId, userId: actor?.id, action: 'customer.created', resource: 'customer', resourceId: customer.id });
    return customer;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError('A customer with this email already exists');
    throw error;
  }
}

export async function updateCustomer(id, organizationId, data, actor) {
  await getCustomer(id, organizationId);
  try {
    const customer = await repository.updateCustomer(id, organizationId, data);
    await recordAudit({ organizationId, userId: actor?.id, action: 'customer.updated', resource: 'customer', resourceId: id });
    return customer;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError('A customer with this email already exists');
    throw error;
  }
}
