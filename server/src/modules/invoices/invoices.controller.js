import * as service from './invoices.service.js';

const paging = (query) => ({
  page: Math.max(Number.parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100),
  search: query.search,
  status: query.status,
  customerId: query.customerId,
  subscriptionId: query.subscriptionId,
});
export const handleListInvoices = async (req, res) => res.json({ success: true, data: await service.listInvoices(req.organization.id, paging(req.query)) });
export const handleGetInvoice = async (req, res) => res.json({ success: true, data: { invoice: await service.getInvoice(req.params.id, req.organization.id) } });
export async function handleCreateInvoice(req, res) {
  const invoice = await service.createInvoice(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { invoice } });
}
export const handleUpdateInvoice = async (req, res) => res.json({ success: true, data: { invoice: await service.updateInvoice(req.params.id, req.organization.id, req.body, req.user) } });
export const handleConfirmInvoice = async (req, res) => res.json({ success: true, data: { invoice: await service.transitionInvoice(req.params.id, req.organization.id, 'CONFIRMED', req.user) } });
export const handleCancelInvoice = async (req, res) => res.json({ success: true, data: { invoice: await service.transitionInvoice(req.params.id, req.organization.id, 'CANCELLED', req.user) } });
export const handleRunBilling = async (req, res) => res.json({ success: true, data: { run: await service.runRecurringBilling(new Date(), req.organization.id) } });
