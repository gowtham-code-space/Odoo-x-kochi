import { ConflictError, NotFoundError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';
import { createOrganizationNotification } from '../../utils/notifications.js';
import { fromPaise, toPaise } from '../../utils/money.js';
import { getPaymentProvider } from './paymentProvider.js';

const paymentInclude = { invoice: { select: { id: true, number: true, status: true, total: true, amountDue: true } } };

function paymentNumber(count) {
  return `PAY/${new Date().getFullYear()}/${String(count + 1).padStart(4, '0')}`;
}

export async function listPayments(organizationId, { page = 1, limit = 20, invoiceId, status } = {}) {
  const where = { organizationId, ...(invoiceId ? { invoiceId } : {}), ...(status ? { status } : {}) };
  const [payments, total] = await Promise.all([
    prisma.payment.findMany({ where, include: paymentInclude, orderBy: { paidAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.payment.count({ where }),
  ]);
  return { payments, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getPayment(id, organizationId) {
  const payment = await prisma.payment.findFirst({ where: { id, organizationId }, include: paymentInclude });
  if (!payment) throw new NotFoundError('Payment not found');
  return payment;
}

export async function recordManualPayment(organizationId, input, actor) {
  const payment = await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findFirst({ where: { id: input.invoiceId, organizationId } });
    if (!invoice) throw new NotFoundError('Invoice not found');
    if (!['CONFIRMED', 'POSTED', 'PARTIAL', 'OVERDUE'].includes(invoice.status)) {
      throw new ConflictError('Only confirmed, overdue, or partially paid invoices can receive payments');
    }
    const amount = toPaise(input.amount);
    const amountDue = toPaise(invoice.amountDue);
    if (amount > amountDue) throw new ConflictError('Payment amount cannot exceed the remaining invoice balance');
    const count = await tx.payment.count({ where: { organizationId } });
    const paymentRecord = await tx.payment.create({
      data: {
        organizationId,
        invoiceId: invoice.id,
        number: paymentNumber(count),
        amount: fromPaise(amount),
        method: input.method,
        reference: input.reference,
        paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
        notes: input.notes,
        status: 'SUCCEEDED',
      },
      include: paymentInclude,
    });
    const amountPaid = toPaise(invoice.amountPaid) + amount;
    const remaining = amountDue - amount;
    await tx.invoice.update({
      where: { id: invoice.id },
      data: {
        amountPaid: fromPaise(amountPaid),
        amountDue: fromPaise(remaining),
        status: remaining === 0n ? 'PAID' : 'PARTIAL',
      },
    });
    return paymentRecord;
  });
  await recordAudit({ organizationId, userId: actor?.id, action: 'payment.recorded', resource: 'payment', resourceId: payment.id, metadata: { invoiceId: input.invoiceId } });
  await createOrganizationNotification({
    organizationId,
    type: 'PAYMENT_SUCCEEDED',
    title: 'Payment recorded',
    body: 'Payment ' + payment.number + ' was recorded against invoice ' + payment.invoice.number + '.',
    metadata: { paymentId: payment.id, invoiceId: input.invoiceId },
  });
  return payment;
}

export async function initiateGatewayPayment(organizationId, input, actor, membership) {
  const invoice = await prisma.invoice.findFirst({ where: { id: input.invoiceId, organizationId } });
  if (!invoice) throw new NotFoundError('Invoice not found');
  if (membership?.role === 'CUSTOMER') {
    const customer = await prisma.customer.findFirst({ where: { organizationId, userId: actor.id, isActive: true } });
    if (!customer || invoice.customerId !== customer.id) throw new NotFoundError('Invoice not found');
  }
  if (invoice.amountDue <= 0) throw new ConflictError('Invoice has no outstanding balance');
  // This throws a clear 503 until genuine provider credentials and a verified
  // adapter are installed. It deliberately does not mark an invoice as paid.
  const provider = getPaymentProvider(input.provider);
  return provider.initiatePayment({ invoice, organizationId, actor });
}
