import * as service from './discounts.service.js';

export async function handleListDiscounts(req, res) {
  const { page, limit, search, isActive } = req.query;
  const data = await service.listDiscounts(req.organization.id, {
    page: Math.max(Number.parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100),
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });
  res.json({ success: true, data });
}
export const handleGetDiscount = async (req, res) => res.json({ success: true, data: { discount: await service.getDiscount(req.params.id, req.organization.id) } });
export async function handleCreateDiscount(req, res) {
  const discount = await service.createDiscount(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { discount } });
}
export const handleUpdateDiscount = async (req, res) => res.json({ success: true, data: { discount: await service.updateDiscount(req.params.id, req.organization.id, req.body, req.user) } });
