import * as service from './customers.service.js';

export async function handleListCustomers(req, res) {
  const { page, limit, search, isActive } = req.query;
  const data = await service.listCustomers(req.organization.id, {
    page: Math.max(Number.parseInt(page, 10) || 1, 1),
    limit: Math.min(Math.max(Number.parseInt(limit, 10) || 20, 1), 100),
    search,
    isActive: isActive === undefined ? undefined : isActive === 'true',
  });
  res.json({ success: true, data });
}

export async function handleGetCustomer(req, res) {
  const customer = await service.getCustomer(req.params.id, req.organization.id);
  res.json({ success: true, data: { customer } });
}

export async function handleCreateCustomer(req, res) {
  const customer = await service.createCustomer(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { customer } });
}

export async function handleUpdateCustomer(req, res) {
  const customer = await service.updateCustomer(req.params.id, req.organization.id, req.body, req.user);
  res.json({ success: true, data: { customer } });
}
