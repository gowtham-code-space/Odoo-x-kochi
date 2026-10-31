import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import { createOrganizationNotification } from '../../utils/notifications.js';
import { nextBillingDate } from '../../utils/billing.js';
import { evaluateDiscount } from '../../utils/discounts.js';
import { calculateLine, fromPaise, percentageOf, sumMoney, toPaise } from '../../utils/money.js';

const invoiceInclude = {
  customer: true,
  subscription: { include: { plan: { include: { product: true } } } },
  lines: { orderBy: { sortOrder: 'asc' } },
  payments: { orderBy: { paidAt: 'desc' } },
};

function invoiceNumber(prefix, count) {
  return `${prefix}/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
}

async function resolveDiscount(tx, organizationId, code) {
  if (!code) return null;
  const discount = await tx.discount.findFirst({ where: { organizationId, code: code.toUpperCase() } });
  if (!discount) throw new NotFoundError('Discount code not found');
  return discount;
}

async function applyDiscount(tx, organizationId, discount, context) {
  if (!discount) return { amount: '0.00', discount: null };
  const customerUses = context.customerId
    ? await tx.discountRedemption.count({ where: { discountId: discount.id, customerId: context.customerId } })
    : 0;
  const evaluated = evaluateDiscount(discount, { ...context, customerUses });
  if (!evaluated.eligible) throw new ConflictError(evaluated.reason);
  return { amount: evaluated.amount, discount };
}

function totalsFromLines(lines, discountAmount = '0.00') {
  const subtotal = sumMoney(lines.map((line) => line.subtotal));
  const rawTax = sumMoney(lines.map((line) => line.taxAmount));
  // Line GST is calculated before a document-level discount. Allocate its
  // reduction proportionally using the effective weighted GST rate.
  const subtotalPaise = toPaise(subtotal);
  const discountPaise = toPaise(discountAmount);
  const taxPaise = toPaise(rawTax);
  const taxAfterDiscount = subtotalPaise === 0n ? 0n : (taxPaise * (subtotalPaise - discountPaise) + subtotalPaise / 2n) / subtotalPaise;
  const total = subtotalPaise - discountPaise + taxAfterDiscount;
  return { subtotal, taxAmount: fromPaise(taxAfterDiscount), total: fromPaise(total) };
}

async function createInvoiceInTransaction(tx, organizationId, input) {
  const settings = await tx.organizationSetting.findUnique({ where: { organizationId } });
  const count = await tx.invoice.count({ where: { organizationId } });
  const discount = await resolveDiscount(tx, organizationId, input.discountCode);
  const lines = input.lines.map((line, index) => ({
    ...line,
    ...calculateLine(line),
    sortOrder: line.sortOrder ?? index,
  }));
  const subtotal = sumMoney(lines.map((line) => line.subtotal));
  const discountResult = await applyDiscount(tx, organizationId, discount, {
    amount: subtotal,
    quantity: lines.reduce((total, line) => total + line.quantity, 0),
    productId: input.productId,
    customerId: input.customerId,
  });
  const totals = totalsFromLines(lines, discountResult.amount);
  const invoice = await tx.invoice.create({
    data: {
      organizationId,
      subscriptionId: input.subscriptionId,
      customerId: input.customerId,
      number: invoiceNumber(settings?.invoicePrefix || 'INV', count),
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      gstin: input.gstin,
      dueDate: new Date(input.dueDate),
      periodStart: input.periodStart ? new Date(input.periodStart) : null,
      periodEnd: input.periodEnd ? new Date(input.periodEnd) : null,
      notes: input.notes,
      ...totals,
      discountAmount: discountResult.amount,
      amountDue: totals.total,
      lines: { create: lines },
    },
    include: invoiceInclude,
  });
  if (discountResult.discount) {
    await tx.discount.update({ where: { id: discountResult.discount.id }, data: { usedCount: { increment: 1 } } });
    await tx.discountRedemption.create({
      data: {
        organizationId,
        discountId: discountResult.discount.id,
        customerId: input.customerId,
        invoiceId: invoice.id,
        amount: discountResult.amount,
      },
    });
  }
  return invoice;
}

export async function listInvoices(organizationId, { page = 1, limit = 20, search, status, customerId, subscriptionId } = {}) {
  const where = {
    organizationId,
    ...(status ? { status } : {}),
    ...(customerId ? { customerId } : {}),
    ...(subscriptionId ? { subscriptionId } : {}),
    ...(search ? { OR: [{ number: { contains: search, mode: 'insensitive' } }, { customerName: { contains: search, mode: 'insensitive' } }] } : {}),
  };
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({ where, include: { customer: { select: { id: true, name: true, email: true } }, subscription: { select: { id: true, number: true } } }, orderBy: { issueDate: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.invoice.count({ where }),
  ]);
  return { invoices, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getInvoice(id, organizationId) {
  const invoice = await prisma.invoice.findFirst({ where: { id, organizationId }, include: invoiceInclude });
  if (!invoice) throw new NotFoundError('Invoice not found');
  return invoice;
}

export async function createInvoice(organizationId, input, actor) {
  const invoice = await prisma.$transaction(async (tx) => {
    let customer = null;
    if (input.customerId) {
      customer = await tx.customer.findFirst({ where: { id: input.customerId, organizationId } });
      if (!customer) throw new NotFoundError('Customer not found');
    }
    if (!customer && (!input.customerName || !input.customerEmail)) throw new ConflictError('A customer is required');
    if (input.subscriptionId) {
      const subscription = await tx.subscription.findFirst({ where: { id: input.subscriptionId, organizationId } });
      if (!subscription) throw new NotFoundError('Subscription not found');
    }
    return createInvoiceInTransaction(tx, organizationId, {
      ...input,
      customerId: customer?.id ?? input.customerId,
      customerName: customer?.name ?? input.customerName,
      customerEmail: customer?.email ?? input.customerEmail,
      gstin: customer?.gstin ?? input.gstin,
    });
  });
  await recordAudit({ organizationId, userId: actor?.id, action: 'invoice.created', resource: 'invoice', resourceId: invoice.id });
  await createOrganizationNotification({
    organizationId,
    type: 'INVOICE_CREATED',
    title: 'Invoice created',
    body: 'Invoice ' + invoice.number + ' was created for ' + invoice.customerName + '.',
    metadata: { invoiceId: invoice.id, customerId: invoice.customerId },
  });
  return invoice;
}

export async function updateInvoice(id, organizationId, data, actor) {
  const invoice = await getInvoice(id, organizationId);
  if (invoice.status !== 'DRAFT') throw new ConflictError('Only draft invoices can be edited');
  const updated = await prisma.invoice.update({ where: { id }, data, include: invoiceInclude });
  await recordAudit({ organizationId, userId: actor?.id, action: 'invoice.updated', resource: 'invoice', resourceId: id });
  return updated;
}

export async function transitionInvoice(id, organizationId, nextStatus, actor) {
  const invoice = await getInvoice(id, organizationId);
  const allowed = nextStatus === 'CONFIRMED'
    ? ['DRAFT']
    : nextStatus === 'CANCELLED' ? ['DRAFT', 'CONFIRMED', 'POSTED'] : [];
  if (!allowed.includes(invoice.status)) throw new ConflictError(`Invoice cannot move from ${invoice.status} to ${nextStatus}`);
  const updated = await prisma.invoice.update({ where: { id }, data: { status: nextStatus }, include: invoiceInclude });
  await recordAudit({ organizationId, userId: actor?.id, action: `invoice.${nextStatus.toLowerCase()}`, resource: 'invoice', resourceId: id });
  await createOrganizationNotification({
    organizationId,
    type: 'INVOICE_' + nextStatus,
    title: 'Invoice ' + nextStatus.toLowerCase(),
    body: 'Invoice ' + updated.number + ' is now ' + nextStatus.toLowerCase() + '.',
    metadata: { invoiceId: updated.id, customerId: updated.customerId },
  });
  return updated;
}

export async function generateRecurringInvoice(subscriptionId, now = new Date()) {
  return prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: { include: { product: true } }, customer: true, discount: true },
    });
    if (!subscription || !['ACTIVE', 'IN_PROGRESS'].includes(subscription.status) || !subscription.nextBillingDate || subscription.nextBillingDate > now) return null;
    const periodStart = subscription.nextBillingDate;
    const periodEnd = nextBillingDate(periodStart, subscription.plan.billingFrequency);
    const dueDate = new Date(periodStart);
    dueDate.setDate(dueDate.getDate() + subscription.paymentTermsDays);
    const invoice = await createInvoiceInTransaction(tx, subscription.organizationId, {
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
      customerName: subscription.customerName,
      customerEmail: subscription.customerEmail,
      gstin: subscription.customer?.gstin,
      dueDate,
      periodStart,
      periodEnd,
      productId: subscription.plan.productId,
      discountCode: subscription.discount?.code,
      lines: [{
        description: `${subscription.plan.name} (${subscription.number})`,
        quantity: subscription.quantity,
        unitPrice: String(subscription.unitPrice),
        taxRate: Number(subscription.taxRate),
      }],
    });
    await tx.subscription.update({ where: { id: subscription.id }, data: { nextBillingDate: periodEnd } });
    return invoice;
  });
}

export async function markOverdueInvoices(now = new Date(), organizationId) {
  return prisma.invoice.updateMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      status: { in: ['CONFIRMED', 'POSTED', 'PARTIAL'] },
      dueDate: { lt: now },
      amountDue: { gt: 0 },
    },
    data: { status: 'OVERDUE' },
  });
}

export async function runRecurringBilling(now = new Date(), organizationId = null) {
  const run = await prisma.billingRun.create({ data: { organizationId } });
  const due = await prisma.subscription.findMany({
    where: {
      ...(organizationId ? { organizationId } : {}),
      status: { in: ['ACTIVE', 'IN_PROGRESS'] },
      nextBillingDate: { lte: now },
    },
    select: { id: true },
  });
  let created = 0;
  const failures = [];
  for (const subscription of due) {
    try {
      const invoice = await generateRecurringInvoice(subscription.id, now);
      if (invoice) created += 1;
    } catch (error) {
      // A unique billing-period constraint makes overlapping workers safe.
      if (error.code !== 'P2002') failures.push({ subscriptionId: subscription.id, message: error.message });
    }
  }
  const overdue = await markOverdueInvoices(now, organizationId);
  const completed = await prisma.billingRun.update({
    where: { id: run.id },
    data: { completedAt: new Date(), status: failures.length ? 'COMPLETED_WITH_FAILURES' : 'COMPLETED', subscriptionsProcessed: due.length, invoicesCreated: created, failures: failures.length ? failures : undefined },
  });
  if (organizationId && (created || overdue.count)) {
    await createOrganizationNotification({
      organizationId,
      type: 'BILLING_RUN_COMPLETED',
      title: 'Billing run completed',
      body: 'Created ' + created + ' invoice(s) and marked ' + overdue.count + ' invoice(s) overdue.',
      metadata: { billingRunId: completed.id, invoicesCreated: created, overdueInvoices: overdue.count },
    });
  }
  return completed;
}

export async function listBillingRuns(organizationId, { page = 1, limit = 20 } = {}) {
  const where = { organizationId };
  const [runs, total] = await Promise.all([
    prisma.billingRun.findMany({ where, orderBy: { startedAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.billingRun.count({ where }),
  ]);
  return { runs, total, page, limit, totalPages: Math.ceil(total / limit) };
}
