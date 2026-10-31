import * as service from './taxes.service.js';

export async function handleListTaxes(req, res) {
  const taxes = await service.listTaxes(req.organization.id, { includeInactive: req.query.includeInactive === 'true' });
  res.json({ success: true, data: { taxes } });
}
export const handleGetTax = async (req, res) => res.json({ success: true, data: { tax: await service.getTax(req.params.id, req.organization.id) } });
export async function handleCreateTax(req, res) {
  const tax = await service.createTax(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { tax } });
}
export const handleUpdateTax = async (req, res) => res.json({ success: true, data: { tax: await service.updateTax(req.params.id, req.organization.id, req.body, req.user) } });
export const handleDeactivateTax = async (req, res) => res.json({ success: true, data: { tax: await service.deactivateTax(req.params.id, req.organization.id, req.user) } });
