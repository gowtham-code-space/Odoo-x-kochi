import * as service from './subscriptions.service.js';

const listInput = (query) => ({
  page: Math.max(Number.parseInt(query.page, 10) || 1, 1),
  limit: Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 100),
  search: query.search,
  status: query.status,
  planId: query.planId,
  customerId: query.customerId,
});

export async function handleListSubscriptions(req, res) {
  res.json({ success: true, data: await service.listSubscriptions(req.organization.id, listInput(req.query)) });
}
export async function handleGetSubscription(req, res) {
  res.json({ success: true, data: { subscription: await service.getSubscription(req.params.id, req.organization.id) } });
}
export async function handleCreateSubscription(req, res) {
  const subscription = await service.createSubscription(req.organization.id, req.body, req.user);
  res.status(201).json({ success: true, data: { subscription } });
}
export async function handleUpdateSubscription(req, res) {
  const subscription = await service.updateSubscription(req.params.id, req.organization.id, req.body, req.user);
  res.json({ success: true, data: { subscription } });
}
export const handleActivateSubscription = async (req, res) => res.json({ success: true, data: { subscription: await service.activateSubscription(req.params.id, req.organization.id, req.user) } });
export const handlePauseSubscription = async (req, res) => res.json({ success: true, data: { subscription: await service.pauseSubscription(req.params.id, req.organization.id, req.user) } });
export const handleResumeSubscription = async (req, res) => res.json({ success: true, data: { subscription: await service.resumeSubscription(req.params.id, req.organization.id, req.user) } });
export const handleCloseSubscription = async (req, res) => res.json({ success: true, data: { subscription: await service.closeSubscription(req.params.id, req.organization.id, req.user, req.body.reason) } });
export const handleRenewSubscription = async (req, res) => res.json({ success: true, data: { subscription: await service.renewSubscription(req.params.id, req.organization.id, req.body, req.user) } });
export const handleChangePlan = async (req, res) => res.json({ success: true, data: { subscription: await service.changePlan(req.params.id, req.organization.id, req.body.planId, req.user, req.body.reason) } });
