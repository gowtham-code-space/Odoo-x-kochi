import * as service from './quotations.service.js';

const pagination = (query) => ({
  page: Math.max(Number.parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100),
  search: query.search,
  status: query.status,
});

export async function handleListQuotations(req, res) {
  res.json({ success: true, data: await service.listQuotations(req.organization.id, pagination(req.query)) });
}
export async function handleGetQuotation(req, res) {
  res.json({ success: true, data: { quotation: await service.getQuotation(req.params.id, req.organization.id) } });
}
export async function handleCreateQuotation(req, res) {
  const quotation = await service.createQuotation(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { quotation } });
}
export async function handleUpdateQuotation(req, res) {
  const quotation = await service.updateQuotation(req.params.id, req.organization.id, req.body, req.user);
  res.json({ success: true, data: { quotation } });
}
export async function handleSendQuotation(req, res) {
  res.json({ success: true, data: { quotation: await service.sendQuotation(req.params.id, req.organization.id, req.user) } });
}
export async function handleAcceptQuotation(req, res) {
  res.json({ success: true, data: { quotation: await service.acceptQuotation(req.params.id, req.organization.id, req.user) } });
}
export async function handleRejectQuotation(req, res) {
  res.json({ success: true, data: { quotation: await service.rejectQuotation(req.params.id, req.organization.id, req.user) } });
}
export async function handleCancelQuotation(req, res) {
  res.json({ success: true, data: { quotation: await service.cancelQuotation(req.params.id, req.organization.id, req.user) } });
}
