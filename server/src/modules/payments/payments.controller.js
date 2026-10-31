import * as service from './payments.service.js';

export async function handleListPayments(req, res) {
  const { page, limit, invoiceId, status } = req.query;
  const data = await service.listPayments(req.organization.id, {
    page: Math.max(Number.parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100),
    invoiceId,
    status,
  });
  res.json({ success: true, data });
}
export const handleGetPayment = async (req, res) => res.json({ success: true, data: { payment: await service.getPayment(req.params.id, req.organization.id) } });
export async function handleRecordPayment(req, res) {
  const payment = await service.recordManualPayment(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { payment } });
}
export const handleInitiatePayment = async (req, res) => res.status(202).json({ success: true, data: { payment: await service.initiateGatewayPayment(req.organization.id, req.body, req.user, req.membership) } });
