import * as service from './plans.service.js';

export async function handleListPlans(req, res) {
  const { page, limit, search, status, productId } = req.query;
  const result = await service.listPlans(req.organization.id, {
    page: parseInt(page) || 1,
    limit: Math.min(parseInt(limit) || 20, 100),
    search,
    status,
    productId,
  });
  res.json({ success: true, data: result });
}

export async function handleGetPlan(req, res) {
  const plan = await service.getPlan(req.params.id, req.organization.id);
  res.json({ success: true, data: { plan } });
}

export async function handleCreatePlan(req, res) {
  const plan = await service.createPlan(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { plan } });
}

export async function handleUpdatePlan(req, res) {
  const plan = await service.updatePlan(req.params.id, req.organization.id, req.body, req.user);
  res.json({ success: true, data: { plan } });
}

export async function handleArchivePlan(req, res) {
  const plan = await service.archivePlan(req.params.id, req.organization.id, req.user);
  res.json({ success: true, data: { plan } });
}

export async function handleActivatePlan(req, res) {
  const plan = await service.activatePlan(req.params.id, req.organization.id, req.user);
  res.json({ success: true, data: { plan } });
}
